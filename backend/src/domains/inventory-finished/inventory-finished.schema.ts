import { z } from "zod";

export const FinishedListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(500),
  category_id: z.string().uuid().optional(),
  inventory_mode: z.enum(["finished_goods", "recipe_realtime"]).optional(),
  status: z.enum(["in_stock", "low_stock", "out_of_stock"]).optional(),
  search: z.string().optional(),
  sort_by: z.enum(["product_name", "current_stock", "stock_value", "last_movement_date"]).default("product_name"),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
});

export type FinishedListQuery = z.infer<typeof FinishedListQuerySchema>;

export const VariantIdParamSchema = z.object({
  variantId: z.string().uuid(),
});

export const FinishedAdjustSchema = z.object({
  type: z.enum(["add", "remove"]),
  quantity: z.coerce.number().int().min(1),
  reason: z.string().min(1).max(500),
  reference: z.string().max(200).optional(),
});

export type FinishedAdjustInput = z.infer<typeof FinishedAdjustSchema>;

export const VariantMovementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  movement_type: z.string().optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export type VariantMovementsQuery = z.infer<typeof VariantMovementsQuerySchema>;
