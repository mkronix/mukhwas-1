import { db } from "../../database/knex";
import type { Knex } from "knex";
import type { AdminProductListQuery } from "./products.schema";

export class ProductRepository {
  static async findGramUnitId(trx: Knex = db): Promise<string | undefined> {
    const row = await trx("units")
      .whereNull("deleted_at")
      .where(function () {
        this.whereILike("abbreviation", "g").orWhereILike("name", "gram");
      })
      .orderBy("is_system", "desc")
      .first();
    return row?.id as string | undefined;
  }

  static async adminFindAll(query: AdminProductListQuery) {
    const base = db("products as p")
      .leftJoin("categories as c", "c.id", "p.category_id")
      .whereNull("p.deleted_at");

    if (query.category_id) base.where("p.category_id", query.category_id);
    if (query.status) base.where("p.status", query.status);
    if (query.inventory_mode) base.where("p.inventory_mode", query.inventory_mode);
    if (query.is_active !== undefined) base.where("p.is_active", query.is_active === "true");
    if (query.search) {
      const term = `%${query.search}%`;
      base.where(function () {
        this.whereILike("p.name", term).orWhereIn("p.id", function () {
          this.select("product_id").from("product_variants").whereILike("sku", term).whereNull("deleted_at");
        });
      });
    }

    const countRow = await base.clone().countDistinct("p.id as count").first();
    const total = Number(countRow?.count ?? 0);
    const offset = (query.page - 1) * query.limit;

    const orderCol =
      query.sort_by === "created_at"
        ? "p.created_at"
        : query.sort_by === "updated_at"
          ? "p.updated_at"
          : query.sort_by === "price"
            ? "p.base_price_paisa"
            : "p.name";
    const orderDir = query.sort_order;

    const rows = await base
      .clone()
      .select(
        "p.*",
        "c.name as category_name",
        db.raw(
          `(SELECT COUNT(*)::int FROM product_variants pv WHERE pv.product_id = p.id AND pv.deleted_at IS NULL) as variant_count`
        ),
        db.raw(
          `(SELECT pv2.price_paisa FROM product_variants pv2 WHERE pv2.product_id = p.id AND pv2.deleted_at IS NULL AND pv2.is_active = true ORDER BY pv2.price_paisa ASC LIMIT 1) as min_variant_price`
        )
      )
      .orderBy(orderCol, orderDir)
      .limit(query.limit)
      .offset(offset);

    const productIds = rows.map((r: { id: string }) => r.id);
    let variantsByProduct: Record<string, Record<string, unknown>[]> = {};
    if (productIds.length) {
      const vars = await db("product_variants as pv")
        .leftJoin("units as u", "u.id", "pv.weight_unit_id")
        .whereIn("pv.product_id", productIds)
        .whereNull("pv.deleted_at")
        .select(
          "pv.*",
          "u.abbreviation as weight_unit_abbr"
        )
        .orderBy("pv.name", "asc");
      variantsByProduct = vars.reduce<Record<string, Record<string, unknown>[]>>((acc, v) => {
        const pid = v.product_id as string;
        if (!acc[pid]) acc[pid] = [];
        acc[pid].push(v);
        return acc;
      }, {});
    }

    return { rows, variantsByProduct, total };
  }

  static async loadVariantsForProducts(trx: Knex, productIds: string[]) {
    if (!productIds.length) return {};
    const vars = await trx("product_variants as pv")
      .leftJoin("units as u", "u.id", "pv.weight_unit_id")
      .whereIn("pv.product_id", productIds)
      .whereNull("pv.deleted_at")
      .select("pv.*", "u.abbreviation as weight_unit_abbr")
      .orderBy("pv.name", "asc");
    return vars.reduce<Record<string, Record<string, unknown>[]>>((acc, v) => {
      const pid = v.product_id as string;
      if (!acc[pid]) acc[pid] = [];
      acc[pid].push(v);
      return acc;
    }, {});
  }

  static async findProductById(trx: Knex, id: string) {
    return trx("products").where({ id }).whereNull("deleted_at").first();
  }

  static async findBySlug(trx: Knex, slug: string) {
    return trx("products").where({ slug }).whereNull("deleted_at").first();
  }

  static async findVariantById(trx: Knex, id: string) {
    return trx("product_variants").where({ id }).whereNull("deleted_at").first();
  }

  static async isSlugTaken(trx: Knex, slug: string, excludeId?: string) {
    const q = trx("products").where({ slug }).whereNull("deleted_at");
    if (excludeId) q.whereNot("id", excludeId);
    const row = await q.first();
    return !!row;
  }

  static async isSkuTaken(trx: Knex, sku: string, excludeVariantId?: string) {
    const q = trx("product_variants").where({ sku }).whereNull("deleted_at");
    if (excludeVariantId) q.whereNot("id", excludeVariantId);
    return !!(await q.first());
  }

  static async getBundleForProduct(trx: Knex, productId: string) {
    return trx("product_bundles").where({ product_id: productId }).first();
  }

  static async getBundleItems(trx: Knex, bundleId: string) {
    return trx("bundle_items as bi")
      .join("product_variants as cv", "cv.id", "bi.component_variant_id")
      .join("products as cp", "cp.id", "cv.product_id")
      .where("bi.product_bundle_id", bundleId)
      .select(
        "bi.id",
        "bi.product_bundle_id as bundle_id",
        "bi.component_variant_id as variant_id",
        "bi.quantity",
        "cv.name as component_variant_name",
        "cp.name as component_product_name"
      );
  }

  static async hasActiveBundleReferencingVariant(trx: Knex, variantId: string) {
    const row = await trx("bundle_items as bi")
      .join("product_bundles as pb", "pb.id", "bi.product_bundle_id")
      .join("products as parent", "parent.id", "pb.product_id")
      .where("bi.component_variant_id", variantId)
      .whereNull("parent.deleted_at")
      .where("parent.is_active", true)
      .first();
    return !!row;
  }

  static async categoryCounts() {
    return db("categories as c")
      .whereNull("c.deleted_at")
      .where("c.is_active", true)
      .whereNull("c.parent_id")
      .leftJoin("products as p", function () {
        this.on("p.category_id", "=", "c.id").andOnNull("p.deleted_at").andOn(db.raw("p.is_active = ?", [true]));
      })
      .select("c.id", "c.name", "c.slug", db.raw("COUNT(DISTINCT p.id)::int as product_count"))
      .groupBy("c.id", "c.name", "c.slug")
      .orderBy("c.sort_order", "asc");
  }

  static async storefrontListFiltered(params: {
    categoryIds: string[];
    weights: string[];
    sort: string;
    inStockOnly: boolean;
    minPrice?: number;
    maxPrice?: number;
    tagFilters: string[];
    page: number;
    perPage: number;
  }) {
    const base = db("products as p")
      .whereNull("p.deleted_at")
      .where("p.is_active", true)
      .where("p.status", "active");

    if (params.categoryIds.length) {
      base.whereIn("p.category_id", params.categoryIds);
    }
    if (params.tagFilters.length) {
      for (const t of params.tagFilters) {
        base.whereRaw("p.tags::jsonb @> ?::jsonb", [JSON.stringify([t])]);
      }
    }

    const minP = params.minPrice ?? 0;
    const maxP = params.maxPrice ?? 999999999;
    base.whereRaw(
      `(SELECT MIN(pv.price_paisa) FROM product_variants pv WHERE pv.product_id = p.id AND pv.deleted_at IS NULL AND pv.is_active = true) BETWEEN ? AND ?`,
      [minP, maxP]
    );

    if (params.inStockOnly) {
      base.whereRaw(
        `EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.deleted_at IS NULL AND pv.is_active = true AND pv.current_stock > 0)`
      );
    }

    if (params.weights.length) {
      base.whereRaw(
        `EXISTS (SELECT 1 FROM product_variants pv WHERE pv.product_id = p.id AND pv.deleted_at IS NULL AND pv.is_active = true AND pv.name IN (${params.weights.map(() => "?").join(",")}))`,
        params.weights
      );
    }

    base.whereRaw(
      `EXISTS (SELECT 1 FROM product_variants pv2 WHERE pv2.product_id = p.id AND pv2.deleted_at IS NULL AND pv2.is_active = true)`
    );

    const countRow = await base.clone().countDistinct("p.id as count").first();
    const total = Number(countRow?.count ?? 0);
    const offset = (params.page - 1) * params.perPage;

    let orderSql = "p.created_at DESC";
    if (params.sort === "newest") orderSql = "p.created_at DESC";
    else if (params.sort === "price-low")
      orderSql = "(SELECT MIN(pv.price_paisa) FROM product_variants pv WHERE pv.product_id = p.id AND pv.deleted_at IS NULL AND pv.is_active = true) ASC NULLS LAST";
    else if (params.sort === "price-high")
      orderSql = "(SELECT MIN(pv.price_paisa) FROM product_variants pv WHERE pv.product_id = p.id AND pv.deleted_at IS NULL AND pv.is_active = true) DESC NULLS LAST";
    else if (params.sort === "best-selling") orderSql = "p.updated_at DESC";
    else orderSql = "p.created_at DESC";

    const rows = await base
      .clone()
      .select("p.*")
      .orderByRaw(orderSql)
      .limit(params.perPage)
      .offset(offset);

    return { rows, total };
  }

  static async resolveCategoryIds(slugsOrIds: string[]): Promise<string[]> {
    if (!slugsOrIds.length) return [];
    const uuids = slugsOrIds.filter((x) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x)
    );
    const slugs = slugsOrIds.filter((x) => !uuids.includes(x));
    const ids = new Set<string>(uuids);
    if (slugs.length) {
      const found = await db("categories").whereIn("slug", slugs).whereNull("deleted_at").select("id");
      for (const f of found) ids.add(f.id as string);
    }
    return [...ids];
  }
}
