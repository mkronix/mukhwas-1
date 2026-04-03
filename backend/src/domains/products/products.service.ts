import { randomBytes } from "crypto";
import type { Knex } from "knex";
import { ApiError } from "../../utils/ApiError";
import { db } from "../../database/knex";
import { buildPaginationMeta } from "../../utils/pagination";
import { ProductRepository } from "./products.repository";
import { UploadService } from "../upload/upload.service";
import type {
  AdminProductListQuery,
  CreateProductInput,
  UpdateProductInput,
  StorefrontProductListQuery,
  DeleteProductImageInput,
} from "./products.schema";

const MAX_PRODUCT_IMAGES = 10;

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function normalizeImages(raw: unknown[]): { url: string; is_primary: boolean }[] {
  const out: { url: string; is_primary: boolean }[] = [];
  for (let i = 0; i < raw.length; i++) {
    const item = raw[i];
    if (typeof item === "string") {
      out.push({ url: item, is_primary: i === 0 });
    } else if (item && typeof item === "object" && "url" in item) {
      const o = item as { url: string; is_primary?: boolean };
      out.push({ url: o.url, is_primary: o.is_primary ?? i === 0 });
    }
  }
  if (out.length && !out.some((x) => x.is_primary)) out[0].is_primary = true;
  return out;
}

function imagesToStrings(imgs: { url: string; is_primary: boolean }[]) {
  const sorted = [...imgs].sort((a, b) => (a.is_primary === b.is_primary ? 0 : a.is_primary ? -1 : 1));
  return sorted.map((x) => x.url);
}

function primaryUrl(imgs: { url: string; is_primary: boolean }[]) {
  const p = imgs.find((x) => x.is_primary);
  return p?.url ?? imgs[0]?.url;
}

function parseImagesJson(val: unknown): { url: string; is_primary: boolean }[] {
  if (!val) return [];
  if (typeof val === "string") {
    try {
      const j = JSON.parse(val) as unknown;
      return normalizeImages(Array.isArray(j) ? j : []);
    } catch {
      return [];
    }
  }
  if (Array.isArray(val)) return normalizeImages(val as unknown[]);
  return [];
}

function parseTagsJson(val: unknown): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(String);
  if (typeof val === "string") {
    try {
      const j = JSON.parse(val) as unknown;
      return Array.isArray(j) ? j.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function weightGrams(weightValue: number, abbr: string | null | undefined) {
  if (abbr && abbr.toLowerCase() === "kg") return Math.round(weightValue * 1000);
  if (abbr && abbr.toLowerCase() === "g") return Math.round(weightValue);
  return Math.round(weightValue);
}

function mapVariant(v: Record<string, unknown>) {
  return {
    id: v.id,
    product_id: v.product_id,
    name: v.name,
    sku: v.sku,
    weight_grams: weightGrams(Number(v.weight_value ?? 0), v.weight_unit_abbr as string),
    price_paisa: Number(v.price_paisa ?? 0),
    compare_at_price_paisa:
      v.compare_at_price_paisa === null || v.compare_at_price_paisa === undefined
        ? undefined
        : Number(v.compare_at_price_paisa),
    stock_quantity: Number(v.current_stock ?? 0),
    low_stock_threshold: Number(v.reorder_level ?? 0),
    is_active: Boolean(v.is_active),
  };
}

function mapProduct(
  p: Record<string, unknown>,
  variants: Record<string, unknown>[],
  extras?: {
    bundle_items?: Record<string, unknown>[];
    is_bundle?: boolean;
    category_name?: string;
    variant_count?: number;
  }
) {
  const imgs = parseImagesJson(p.images);
  const tags = parseTagsJson(p.tags);
  const ui = p.ui && typeof p.ui === "object" ? (p.ui as Record<string, unknown>) : undefined;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description ?? "",
    category_id: p.category_id,
    subcategory_id: p.subcategory_id ?? undefined,
    base_price_paisa: Number(p.base_price_paisa ?? 0),
    gst_slab: p.gst_slab,
    hsn_code: p.hsn_code ?? "",
    inventory_mode: p.inventory_mode,
    is_active: Boolean(p.is_active),
    image_url: primaryUrl(imgs),
    images: imagesToStrings(imgs),
    meta_title: p.meta_title ?? undefined,
    meta_description: p.meta_description ?? undefined,
    tags,
    ui,
    variants: variants.map(mapVariant),
    created_at: p.created_at ? new Date(p.created_at as Date).toISOString() : "",
    updated_at: p.updated_at ? new Date(p.updated_at as Date).toISOString() : "",
    ...(extras?.is_bundle !== undefined ? { is_bundle: extras.is_bundle } : {}),
    ...(extras?.bundle_items ? { bundle_items: extras.bundle_items } : {}),
    ...(extras?.category_name ? { category_name: extras.category_name } : {}),
    ...(extras?.variant_count !== undefined ? { variant_count: extras.variant_count } : {}),
  };
}

async function assertCategoryActive(trx: Knex, categoryId: string) {
  const cat = await trx("categories").where({ id: categoryId }).whereNull("deleted_at").first();
  if (!cat) throw ApiError.unprocessable("Category not found");
  if (!cat.is_active) throw ApiError.unprocessable("Category is inactive");
}

function genSku(prefix: string) {
  return `${prefix.slice(0, 6).toUpperCase()}-${randomBytes(3).toString("hex").toUpperCase()}`;
}

export class ProductService {
  static async adminList(query: AdminProductListQuery) {
    const { rows, variantsByProduct, total } = await ProductRepository.adminFindAll(query);
    const data = await Promise.all(
      rows.map(async (r: Record<string, unknown>) => {
        const vars = variantsByProduct[r.id as string] ?? [];
        const bundle = await ProductRepository.getBundleForProduct(db, r.id as string);
        let bundleItems: Record<string, unknown>[] | undefined;
        if (bundle) {
          bundleItems = await ProductRepository.getBundleItems(db, bundle.id as string);
        }
        return mapProduct(r, vars, {
          is_bundle: !!bundle,
          bundle_items: bundleItems?.map((b) => ({
            id: b.id,
            bundle_id: b.bundle_id,
            variant_id: b.variant_id,
            quantity: b.quantity,
            component_variant_name: b.component_variant_name,
            component_product_name: b.component_product_name,
          })),
          category_name: r.category_name as string,
          variant_count: Number(r.variant_count ?? 0),
        });
      })
    );
    const meta = buildPaginationMeta({ page: query.page, limit: query.limit, total });
    return { data, meta };
  }

  static async adminGetById(id: string) {
    const p = await ProductRepository.findProductById(db, id);
    if (!p) throw ApiError.notFound("Product not found");
    const vars = (await ProductRepository.loadVariantsForProducts(db, [id]))[id] ?? [];
    const bundle = await ProductRepository.getBundleForProduct(db, id);
    let bundleItems: Record<string, unknown>[] | undefined;
    if (bundle) bundleItems = await ProductRepository.getBundleItems(db, bundle.id as string);
    return mapProduct(p, vars, {
      is_bundle: !!bundle,
      bundle_items: bundleItems?.map((b) => ({
        id: b.id,
        bundle_id: b.bundle_id,
        variant_id: b.variant_id,
        quantity: b.quantity,
        component_variant_name: b.component_variant_name,
        component_product_name: b.component_product_name,
      })),
    });
  }

  static async categoriesWithCounts() {
    const rows = await ProductRepository.categoryCounts();
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      product_count: Number(r.product_count ?? 0),
    }));
  }

  static async create(input: CreateProductInput) {
    if (input.is_bundle && (!input.bundle_items || input.bundle_items.length === 0)) {
      throw ApiError.unprocessable("Bundle requires bundle_items");
    }
    const gramId = await ProductRepository.findGramUnitId();
    if (!gramId) throw ApiError.internal("No weight unit configured");

    const slug = input.slug?.trim() || slugify(input.name);
    const images = normalizeImages((input.images as unknown[]) ?? []);
    if (images.length > MAX_PRODUCT_IMAGES) throw ApiError.unprocessable(`Maximum ${MAX_PRODUCT_IMAGES} images`);

    return db.transaction(async (trx) => {
      if (await ProductRepository.isSlugTaken(trx, slug)) throw ApiError.conflict("Slug already in use");
      await assertCategoryActive(trx, input.category_id);

      const status = input.status ?? (input.is_active ? "active" : "inactive");
      const [product] = await trx("products")
        .insert({
          name: input.name,
          slug,
          description: input.description ?? "",
          category_id: input.category_id,
          subcategory_id: input.subcategory_id ?? null,
          status,
          images: images as unknown as Record<string, unknown>,
          meta_title: input.meta_title ?? null,
          meta_description: input.meta_description ?? null,
          tags: (input.tags ?? []) as unknown as Record<string, unknown>,
          ui: (input.ui ?? null) as unknown as Record<string, unknown> | null,
          gst_slab: input.gst_slab,
          hsn_code: input.hsn_code ?? "",
          base_price_paisa: input.base_price_paisa,
          inventory_mode: input.inventory_mode,
          is_active: input.is_active,
        })
        .returning("*");

      const pid = product.id as string;
      const variantRows: Record<string, unknown>[] = [];

      for (const v of input.variants) {
        let sku = v.sku?.trim();
        if (!sku) sku = genSku(slug);
        if (await ProductRepository.isSkuTaken(trx, sku)) {
          sku = genSku(slug);
        }
        const [vr] = await trx("product_variants")
          .insert({
            product_id: pid,
            name: v.name,
            sku,
            price_paisa: v.price_paisa,
            compare_at_price_paisa: v.compare_at_price_paisa ?? null,
            weight_value: v.weight_grams,
            weight_unit_id: gramId,
            barcode: v.barcode ?? null,
            inventory_mode: input.inventory_mode,
            current_stock: v.stock_quantity,
            reorder_level: v.low_stock_threshold,
            is_active: v.is_active,
          })
          .returning("*");
        variantRows.push(vr);
      }

      if (input.is_bundle && input.bundle_items?.length) {
        const [pb] = await trx("product_bundles").insert({ product_id: pid }).returning("*");
        for (const bi of input.bundle_items) {
          const cv = await ProductRepository.findVariantById(trx, bi.variant_id);
          if (!cv) throw ApiError.unprocessable("Component variant not found");
          await trx("bundle_items").insert({
            product_bundle_id: pb.id,
            component_variant_id: bi.variant_id,
            quantity: bi.quantity,
          });
        }
      }

      const vars = (await ProductRepository.loadVariantsForProducts(trx, [pid]))[pid] ?? [];
      return mapProduct(product, vars, { is_bundle: !!input.is_bundle });
    });
  }

  static async update(id: string, input: UpdateProductInput) {
    const gramId = await ProductRepository.findGramUnitId();
    if (!gramId) throw ApiError.internal("No weight unit configured");

    return db.transaction(async (trx) => {
      const existing = await ProductRepository.findProductById(trx, id);
      if (!existing) throw ApiError.notFound("Product not found");

      if (input.slug !== undefined) {
        if (await ProductRepository.isSlugTaken(trx, input.slug, id)) throw ApiError.conflict("Slug already in use");
      }
      if (input.category_id) await assertCategoryActive(trx, input.category_id);

      const patch: Record<string, unknown> = {};
      if (input.name !== undefined) patch.name = input.name;
      if (input.slug !== undefined) patch.slug = input.slug;
      if (input.description !== undefined) patch.description = input.description;
      if (input.category_id !== undefined) patch.category_id = input.category_id;
      if (input.subcategory_id !== undefined) patch.subcategory_id = input.subcategory_id;
      if (input.base_price_paisa !== undefined) patch.base_price_paisa = input.base_price_paisa;
      if (input.gst_slab !== undefined) patch.gst_slab = input.gst_slab;
      if (input.hsn_code !== undefined) patch.hsn_code = input.hsn_code;
      if (input.inventory_mode !== undefined) patch.inventory_mode = input.inventory_mode;
      if (input.is_active !== undefined) {
        patch.is_active = input.is_active;
        if (input.status === undefined) patch.status = input.is_active ? "active" : "inactive";
      }
      if (input.status !== undefined) patch.status = input.status;
      if (input.meta_title !== undefined) patch.meta_title = input.meta_title;
      if (input.meta_description !== undefined) patch.meta_description = input.meta_description;
      if (input.tags !== undefined) patch.tags = input.tags as unknown as Record<string, unknown>;
      if (input.ui !== undefined) patch.ui = (input.ui ?? null) as unknown as Record<string, unknown> | null;
      if (input.images !== undefined) {
        const imgs = normalizeImages((input.images as unknown[]) ?? []);
        if (imgs.length > MAX_PRODUCT_IMAGES) throw ApiError.unprocessable(`Maximum ${MAX_PRODUCT_IMAGES} images`);
        patch.images = imgs as unknown as Record<string, unknown>;
      }

      if (Object.keys(patch).length) {
        patch.updated_at = trx.fn.now();
        await trx("products").where({ id }).update(patch);
      }

      const invMode = (input.inventory_mode ?? existing.inventory_mode) as string;

      if (input.variants?.length) {
        const currentIds = new Set(
          (
            await trx("product_variants").where({ product_id: id }).whereNull("deleted_at").select("id")
          ).map((x) => x.id as string)
        );
        const incomingIds = new Set(input.variants.filter((v) => v.id).map((v) => v.id as string));
        for (const cid of currentIds) {
          if (!incomingIds.has(cid)) {
            const vr = await ProductRepository.findVariantById(trx, cid);
            if (vr && Number(vr.current_stock) > 0) {
              throw ApiError.conflict("Cannot remove variant with stock", "VARIANT_HAS_STOCK", {
                variant_id: cid,
                current_stock: vr.current_stock,
              });
            }
            await trx("product_variants").where({ id: cid }).update({ deleted_at: trx.fn.now() });
          }
        }

        for (const v of input.variants) {
          if (v.id) {
            const cur = await trx("product_variants")
              .where({ id: v.id, product_id: id })
              .whereNull("deleted_at")
              .first();
            if (!cur) throw ApiError.unprocessable("Variant not found");
            let sku = v.sku?.trim() || String(cur.sku);
            const taken = await ProductRepository.isSkuTaken(trx, sku, v.id);
            if (taken) throw ApiError.conflict("SKU already in use");
            await trx("product_variants")
              .where({ id: v.id, product_id: id })
              .update({
                name: v.name ?? cur.name,
                sku,
                price_paisa: v.price_paisa ?? Number(cur.price_paisa),
                compare_at_price_paisa:
                  v.compare_at_price_paisa !== undefined
                    ? v.compare_at_price_paisa
                    : cur.compare_at_price_paisa,
                weight_value: v.weight_grams ?? Number(cur.weight_value),
                weight_unit_id: gramId,
                barcode: v.barcode !== undefined ? v.barcode : cur.barcode,
                inventory_mode: invMode,
                current_stock: v.stock_quantity ?? Number(cur.current_stock),
                reorder_level: v.low_stock_threshold ?? Number(cur.reorder_level),
                is_active: v.is_active ?? Boolean(cur.is_active),
                updated_at: trx.fn.now(),
              });
          } else {
            if (!v.name || v.price_paisa === undefined) {
              throw ApiError.unprocessable("New variant requires name and price");
            }
            let sku = v.sku?.trim() ?? genSku(String(existing.slug));
            if (await ProductRepository.isSkuTaken(trx, sku)) sku = genSku(String(existing.slug));
            await trx("product_variants").insert({
              product_id: id,
              name: v.name,
              sku,
              price_paisa: v.price_paisa,
              compare_at_price_paisa: v.compare_at_price_paisa ?? null,
              weight_value: v.weight_grams ?? 0,
              weight_unit_id: gramId,
              barcode: v.barcode ?? null,
              inventory_mode: invMode,
              current_stock: v.stock_quantity ?? 0,
              reorder_level: v.low_stock_threshold ?? 10,
              is_active: v.is_active ?? true,
            });
          }
        }
      }

      if (input.is_bundle !== undefined || input.bundle_items !== undefined) {
        const prevBundle = await ProductRepository.getBundleForProduct(trx, id);
        if (prevBundle) {
          await trx("bundle_items").where({ product_bundle_id: prevBundle.id }).del();
          await trx("product_bundles").where({ id: prevBundle.id }).del();
        }
        const wantBundle =
          input.is_bundle === true ||
          (input.bundle_items !== undefined && (input.bundle_items?.length ?? 0) > 0);
        const items = input.bundle_items;
        if (wantBundle && items?.length) {
          const [pb] = await trx("product_bundles").insert({ product_id: id }).returning("*");
          for (const bi of items) {
            await trx("bundle_items").insert({
              product_bundle_id: pb.id,
              component_variant_id: bi.variant_id,
              quantity: bi.quantity,
            });
          }
        }
      }

      const p = await ProductRepository.findProductById(trx, id);
      const vars = (await ProductRepository.loadVariantsForProducts(trx, [id]))[id] ?? [];
      const nb = await ProductRepository.getBundleForProduct(trx, id);
      return mapProduct(p as Record<string, unknown>, vars, { is_bundle: !!nb });
    });
  }

  static async archive(id: string) {
    const p = await ProductRepository.findProductById(db, id);
    if (!p) throw ApiError.notFound("Product not found");
    await db("products")
      .where({ id })
      .update({ is_active: false, status: "inactive", updated_at: db.fn.now() });
  }

  static async remove(id: string) {
    await db.transaction(async (trx) => {
      const p = await ProductRepository.findProductById(trx, id);
      if (!p) throw ApiError.notFound("Product not found");
      const vars = await trx("product_variants").where({ product_id: id }).whereNull("deleted_at");
      for (const v of vars) {
        if (Number(v.current_stock) > 0) {
          throw ApiError.conflict("Product has stock on hand");
        }
        if (await ProductRepository.hasActiveBundleReferencingVariant(trx, v.id as string)) {
          throw ApiError.conflict("Product variant is used in an active bundle");
        }
      }
      await trx("product_variants").where({ product_id: id }).update({ deleted_at: trx.fn.now() });
      await trx("products").where({ id }).update({ deleted_at: trx.fn.now() });
    });
  }

  static async addImage(productId: string, file: Express.Multer.File) {
    const p = await ProductRepository.findProductById(db, productId);
    if (!p) throw ApiError.notFound("Product not found");
    const imgs = parseImagesJson(p.images);
    if (imgs.length >= MAX_PRODUCT_IMAGES) throw ApiError.unprocessable(`Maximum ${MAX_PRODUCT_IMAGES} images`);
    const uploaded = await UploadService.uploadBuffer(file.buffer, file.mimetype, {
      folder: "mukhwas/products",
      resourceType: "image",
    });
    imgs.push({ url: uploaded.url, is_primary: imgs.length === 0 });
    await db("products").where({ id: productId }).update({
      images: imgs as unknown as Record<string, unknown>,
      updated_at: db.fn.now(),
    });
    return { url: uploaded.url, public_id: uploaded.public_id, images: imagesToStrings(imgs) };
  }

  static async deleteImage(productId: string, input: DeleteProductImageInput) {
    const p = await ProductRepository.findProductById(db, productId);
    if (!p) throw ApiError.notFound("Product not found");
    let imgs = parseImagesJson(p.images);
    let publicId = input.public_id;
    if (input.url && !publicId) {
      const u = input.url;
      const idx = u.indexOf("/upload/");
      if (idx >= 0) {
        const rest = u.slice(idx + "/upload/".length);
        const withoutExt = rest.replace(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i, "");
        const parts = withoutExt.split("/").filter(Boolean);
        if (parts[0]?.match(/^v\d+$/)) parts.shift();
        publicId = parts.join("/");
      }
    }
    imgs = imgs.filter((im) => {
      if (input.url && im.url === input.url) return false;
      if (publicId && im.url.includes(publicId)) return false;
      return true;
    });
    if (imgs.length && !imgs.some((x) => x.is_primary)) imgs[0].is_primary = true;
    await db("products").where({ id: productId }).update({
      images: imgs as unknown as Record<string, unknown>,
      updated_at: db.fn.now(),
    });
    if (publicId) {
      try {
        await UploadService.deleteByPublicId(publicId);
      } catch {
        /* ignore */
      }
    }
    return { images: imagesToStrings(imgs) };
  }

  static async storefrontList(query: StorefrontProductListQuery) {
    const categoryIds = await ProductRepository.resolveCategoryIds(query.category ?? []);
    const minPrice = query.minPrice;
    const maxPrice = query.maxPrice ?? 200000;
    const { rows, total } = await ProductRepository.storefrontListFiltered({
      categoryIds,
      weights: query.weight ?? [],
      sort: query.sort ?? "featured",
      inStockOnly: query.inStock === "true",
      minPrice,
      maxPrice,
      tagFilters: query.tags ?? [],
      page: query.page,
      perPage: query.per_page,
    });
    const ids = rows.map((r: { id: string }) => r.id);
    const varsMap = await ProductRepository.loadVariantsForProducts(db, ids);
    const data = rows.map((r: Record<string, unknown>) => {
      const vars = (varsMap[r.id as string] ?? []).filter((v) => v.is_active);
      return mapProduct(r, vars as Record<string, unknown>[]);
    });
    const meta = buildPaginationMeta({ page: query.page, limit: query.per_page, total });
    return { data, meta };
  }

  static async storefrontDetailBySlug(slug: string) {
    const p = await ProductRepository.findBySlug(db, slug);
    if (!p || !p.is_active) throw ApiError.notFound("Product not found");
    const id = p.id as string;
    let vars = (await ProductRepository.loadVariantsForProducts(db, [id]))[id] ?? [];
    vars = vars.filter((v) => v.is_active);
    const bundle = await ProductRepository.getBundleForProduct(db, id);
    let bundleItems: Record<string, unknown>[] | undefined;
    if (bundle) bundleItems = await ProductRepository.getBundleItems(db, bundle.id as string);
    const related = await db("products")
      .where("category_id", p.category_id)
      .whereNot("id", id)
      .whereNull("deleted_at")
      .where("is_active", true)
      .orderBy("created_at", "desc")
      .limit(4);
    const relIds = related.map((x) => x.id as string);
    const relVars = await ProductRepository.loadVariantsForProducts(db, relIds);
    const relatedMapped = related.map((rp) =>
      mapProduct(rp as Record<string, unknown>, (relVars[rp.id as string] ?? []).filter((v) => v.is_active) as Record<
        string,
        unknown
      >[])
    );
    return {
      product: mapProduct(p as Record<string, unknown>, vars as Record<string, unknown>[], {
        is_bundle: !!bundle,
        bundle_items: bundleItems?.map((b) => ({
          id: b.id,
          bundle_id: b.bundle_id,
          variant_id: b.variant_id,
          quantity: b.quantity,
        })),
      }),
      related_products: relatedMapped,
    };
  }

  static async storefrontDetailById(id: string) {
    const p = await ProductRepository.findProductById(db, id);
    if (!p || !p.is_active) throw ApiError.notFound("Product not found");
    let vars = (await ProductRepository.loadVariantsForProducts(db, [id]))[id] ?? [];
    vars = vars.filter((v) => v.is_active);
    const bundle = await ProductRepository.getBundleForProduct(db, id);
    let bundleItems: Record<string, unknown>[] | undefined;
    if (bundle) bundleItems = await ProductRepository.getBundleItems(db, bundle.id as string);
    const related = await db("products")
      .where("category_id", p.category_id)
      .whereNot("id", id)
      .whereNull("deleted_at")
      .where("is_active", true)
      .orderBy("created_at", "desc")
      .limit(4);
    const relIds = related.map((x) => x.id as string);
    const relVars = await ProductRepository.loadVariantsForProducts(db, relIds);
    const relatedMapped = related.map((rp) =>
      mapProduct(rp as Record<string, unknown>, (relVars[rp.id as string] ?? []).filter((v) => v.is_active) as Record<
        string,
        unknown
      >[])
    );
    return {
      product: mapProduct(p as Record<string, unknown>, vars as Record<string, unknown>[], {
        is_bundle: !!bundle,
        bundle_items: bundleItems?.map((b) => ({
          id: b.id,
          bundle_id: b.bundle_id,
          variant_id: b.variant_id,
          quantity: b.quantity,
        })),
      }),
      related_products: relatedMapped,
    };
  }

  static async posCatalog() {
    const rows = await db("products as p")
      .whereNull("p.deleted_at")
      .where("p.is_active", true)
      .where("p.status", "active")
      .orderBy("p.name", "asc");
    const ids = rows.map((r) => r.id as string);
    const varsMap = await ProductRepository.loadVariantsForProducts(db, ids);
    return rows.map((r) => {
      const vars = (varsMap[r.id as string] ?? []).filter((v) => v.is_active && Number(v.current_stock) >= 0);
      return mapProduct(r as Record<string, unknown>, vars as Record<string, unknown>[]);
    });
  }
}
