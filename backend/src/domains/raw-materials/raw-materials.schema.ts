import { z } from "zod";

export const RawMaterialListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  supplier: z.string().optional(),
  gst_slab: z.enum(["0", "5", "12", "18", "28"]).optional(),
  is_active: z.enum(["true", "false"]).optional(),
});

export type RawMaterialListQuery = z.infer<typeof RawMaterialListQuerySchema>;

export const CreateRawMaterialSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().default(""),
  unit_id: z.string().uuid(),
  current_stock: z.number().min(0).default(0),
  reorder_level: z.number().min(0).default(0),
  preferred_supplier_id: z.string().nullable().optional(),
  hsn_code: z.string().min(1).max(20),
  gst_slab: z.enum(["0", "5", "12", "18", "28"]),
  cost_per_unit_paisa: z.number().int().min(0).default(0),
});

export type CreateRawMaterialInput = z.infer<typeof CreateRawMaterialSchema>;

export const UpdateRawMaterialSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  unit_id: z.string().uuid().optional(),
  reorder_level: z.number().min(0).optional(),
  preferred_supplier_id: z.string().nullable().optional(),
  hsn_code: z.string().min(1).max(20).optional(),
  gst_slab: z.enum(["0", "5", "12", "18", "28"]).optional(),
  cost_per_unit_paisa: z.number().int().min(0).optional(),
});

export type UpdateRawMaterialInput = z.infer<typeof UpdateRawMaterialSchema>;

export const LinkSupplierSchema = z.object({
  supplier_id: z.string().min(1),
  is_preferred: z.boolean().default(false),
});

export type LinkSupplierInput = z.infer<typeof LinkSupplierSchema>;

export const MovementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type MovementQuery = z.infer<typeof MovementQuerySchema>;

export const IdParamSchema = z.object({
  id: z.string().uuid(),
});

export const SupplierUnlinkParamSchema = z.object({
  id: z.string().uuid(),
  supplierId: z.string().min(1),
});
