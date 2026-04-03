import { z } from "zod";

export const PurchaseOrderIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const poLineItemSchema = z.object({
  id: z.string().uuid().optional(),
  raw_material_id: z.string().uuid(),
  raw_material_name: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  unit_price_paisa: z.coerce.number().int().nonnegative(),
  hsn_code: z.string().default(""),
  gst_slab: z.string().default(""),
  taxable_paisa: z.coerce.number().int().nonnegative(),
  gst_amount_paisa: z.coerce.number().int().nonnegative(),
  total_paisa: z.coerce.number().int().nonnegative(),
});

export const CreatePurchaseOrderSchema = z.object({
  supplier_id: z.string().uuid(),
  supplier_name: z.string().min(1),
  order_date: z.string().min(1),
  expected_delivery: z.string().min(1),
  items: z.array(poLineItemSchema).min(1),
  status: z.enum(["draft", "sent", "received", "billed", "cancelled"]).default("draft"),
  notes: z.string().default(""),
  subtotal_paisa: z.coerce.number().int().nonnegative(),
  cgst_paisa: z.coerce.number().int().nonnegative(),
  sgst_paisa: z.coerce.number().int().nonnegative(),
  total_paisa: z.coerce.number().int().nonnegative(),
  created_by: z.string().default(""),
});

export type CreatePurchaseOrderInput = z.infer<typeof CreatePurchaseOrderSchema>;

export const PatchPurchaseOrderStatusSchema = z.object({
  status: z.enum(["draft", "sent", "received", "billed", "cancelled"]),
});

export type PatchPurchaseOrderStatusInput = z.infer<typeof PatchPurchaseOrderStatusSchema>;

export const PutPosPurchaseOrderSchema = CreatePurchaseOrderSchema.partial().extend({
  items: z.array(poLineItemSchema).optional(),
});

export type PutPosPurchaseOrderInput = z.infer<typeof PutPosPurchaseOrderSchema>;
