import { z } from "zod";

const gstSlab = z.enum(["0", "5", "12", "18", "28"]);
const inventoryMode = z.enum(["finished_goods", "recipe_realtime"]);
const productStatus = z.enum(["active", "inactive"]);

const imageItem = z.union([
  z.string(),
  z.object({ url: z.string(), is_primary: z.boolean().optional() }),
]);

const variantInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(100),
  sku: z.string().max(100).optional(),
  weight_grams: z.number().min(0).default(0),
  price_paisa: z.number().int().min(0),
  compare_at_price_paisa: z.number().int().min(0).optional().nullable(),
  stock_quantity: z.number().int().min(0).default(0),
  low_stock_threshold: z.number().int().min(0).default(10),
  is_active: z.boolean().default(true),
  barcode: z.string().max(80).optional().nullable(),
});

const bundleItemInput = z.object({
  variant_id: z.string().uuid(),
  quantity: z.number().int().min(1),
});

export const AdminProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(500),
  category_id: z.string().uuid().optional(),
  status: productStatus.optional(),
  inventory_mode: inventoryMode.optional(),
  is_active: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
  sort_by: z.enum(["name", "created_at", "price", "updated_at"]).default("name"),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
});

export type AdminProductListQuery = z.infer<typeof AdminProductListQuerySchema>;

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().default(""),
  category_id: z.string().uuid(),
  subcategory_id: z.string().uuid().optional().nullable(),
  base_price_paisa: z.number().int().min(0).default(0),
  gst_slab: gstSlab.default("5"),
  hsn_code: z.string().max(20).default(""),
  inventory_mode: inventoryMode.default("finished_goods"),
  is_active: z.boolean().default(true),
  status: productStatus.optional(),
  images: z.array(imageItem).default([]),
  meta_title: z.string().max(255).optional().nullable(),
  meta_description: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  ui: z.unknown().optional().nullable(),
  variants: z.array(variantInput).min(1),
  is_bundle: z.boolean().optional().default(false),
  bundle_items: z.array(bundleItemInput).optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;

const variantPatch = variantInput.partial().extend({
  id: z.string().uuid().optional(),
});

export const UpdateProductSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category_id: z.string().uuid().optional(),
  subcategory_id: z.string().uuid().optional().nullable(),
  base_price_paisa: z.number().int().min(0).optional(),
  gst_slab: gstSlab.optional(),
  hsn_code: z.string().max(20).optional(),
  inventory_mode: inventoryMode.optional(),
  is_active: z.boolean().optional(),
  status: productStatus.optional(),
  images: z.array(imageItem).optional(),
  meta_title: z.string().max(255).optional().nullable(),
  meta_description: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  ui: z.unknown().optional().nullable(),
  variants: z.array(variantPatch).optional(),
  is_bundle: z.boolean().optional(),
  bundle_items: z.array(bundleItemInput).optional(),
});

export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;

export const IdParamSchema = z.object({
  id: z.string().uuid(),
});

export const SlugParamSchema = z.object({
  slug: z.string().min(1),
});

function queryStringArray(val: unknown): string[] {
  if (val === undefined || val === null) return [];
  if (Array.isArray(val)) return val.map(String);
  return [String(val)];
}

export const StorefrontProductListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(500).default(500),
  category: z.preprocess(queryStringArray, z.array(z.string()).optional()),
  weight: z.preprocess(queryStringArray, z.array(z.string()).optional()),
  tags: z.preprocess(queryStringArray, z.array(z.string()).optional()),
  sort: z
    .enum(["featured", "newest", "price-low", "price-high", "best-selling"])
    .optional()
    .default("featured"),
  inStock: z.enum(["true", "false"]).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
});

export type StorefrontProductListQuery = z.infer<typeof StorefrontProductListQuerySchema>;

export const DeleteProductImageSchema = z.object({
  url: z.string().optional(),
  public_id: z.string().optional(),
}).refine((d) => !!d.url || !!d.public_id, { message: "url or public_id required" });

export type DeleteProductImageInput = z.infer<typeof DeleteProductImageSchema>;
