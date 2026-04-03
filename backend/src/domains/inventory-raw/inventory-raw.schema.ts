import { z } from "zod";

export const RawInventoryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(500),
  supplier_id: z.string().uuid().optional(),
  gst_slab: z.enum(["0", "5", "12", "18", "28"]).optional(),
  status: z.enum(["in_stock", "low_stock", "out_of_stock"]).optional(),
  search: z.string().optional(),
  sort_by: z.enum(["name", "current_stock", "stock_value", "last_movement_date"]).default("name"),
  sort_order: z.enum(["asc", "desc"]).default("asc"),
});

export type RawInventoryListQuery = z.infer<typeof RawInventoryListQuerySchema>;

export const MaterialIdParamSchema = z.object({
  materialId: z.string().uuid(),
});

export const RawAdjustSchema = z.object({
  type: z.enum(["add", "remove"]),
  quantity: z.coerce.number().int().min(1),
  reason: z.string().min(1).max(500),
});

export type RawAdjustInput = z.infer<typeof RawAdjustSchema>;
