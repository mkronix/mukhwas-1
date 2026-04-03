import { z } from "zod";

export const ProductionOrderIdParamSchema = z.object({
  id: z.string().uuid(),
});

const materialCreateSchema = z.object({
  raw_material_id: z.string().uuid(),
  raw_material_name: z.string().min(1),
  reserved_quantity: z.coerce.number().nonnegative(),
  unit: z.string().min(1),
});

export const CreateProductionOrderSchema = z.object({
  recipe_id: z.string().min(1),
  recipe_name: z.string().min(1),
  recipe_version: z.coerce.number().int().min(1).default(1),
  output_variant_id: z.string().uuid().optional().nullable(),
  product_variant: z.string().min(1),
  planned_quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  scheduled_date: z.string().min(1),
  assigned_staff_id: z.string().default(""),
  assigned_staff_name: z.string().default(""),
  created_by: z.string().default(""),
  materials: z.array(materialCreateSchema).default([]),
});

export type CreateProductionOrderInput = z.infer<typeof CreateProductionOrderSchema>;

export const PatchProductionOrderStatusSchema = z.object({
  status: z.enum(["in_progress", "cancelled"]),
  staff_name: z.string().default(""),
});

export type PatchProductionOrderStatusInput = z.infer<typeof PatchProductionOrderStatusSchema>;

export const CompleteProductionOrderSchema = z.object({
  actual_quantity: z.coerce.number().nonnegative(),
  material_usage: z.record(z.string(), z.coerce.number().nonnegative()).default({}),
  staff_name: z.string().default(""),
  output_variant_id: z.string().uuid().optional(),
});

export type CompleteProductionOrderInput = z.infer<typeof CompleteProductionOrderSchema>;
