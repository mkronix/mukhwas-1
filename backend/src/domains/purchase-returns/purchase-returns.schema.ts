import { z } from "zod";

export const PurchaseReturnIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const returnItemSchema = z.object({
  raw_material_name: z.string().min(1),
  quantity: z.coerce.number().positive(),
  unit: z.string().min(1),
  amount_paisa: z.coerce.number().int().nonnegative(),
  raw_material_id: z.string().uuid().optional(),
});

export const CreatePurchaseReturnSchema = z.object({
  bill_id: z.string().uuid(),
  bill_number: z.string().min(1),
  supplier_id: z.string().uuid(),
  supplier_name: z.string().min(1),
  return_date: z.string().min(1),
  items: z.array(returnItemSchema).min(1),
  total_paisa: z.coerce.number().int().nonnegative(),
  reason: z.string().default(""),
  status: z.enum(["requested", "approved", "sent", "credited"]).default("requested"),
});

export type CreatePurchaseReturnInput = z.infer<typeof CreatePurchaseReturnSchema>;

export const PatchPurchaseReturnStatusSchema = z.object({
  status: z.enum(["requested", "approved", "sent", "credited"]),
});

export type PatchPurchaseReturnStatusInput = z.infer<typeof PatchPurchaseReturnStatusSchema>;
