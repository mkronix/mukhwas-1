import { z } from "zod";

export const PurchaseBillIdParamSchema = z.object({
  id: z.string().uuid(),
});

const billLineItemSchema = z.object({
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

export const CreatePurchaseBillSchema = z.object({
  bill_number: z.string().optional(),
  po_id: z
    .union([z.string().uuid(), z.literal("")])
    .optional()
    .transform((v) => (v && v !== "" ? v : undefined)),
  po_number: z.string().default(""),
  supplier_id: z.string().uuid(),
  supplier_name: z.string().min(1),
  supplier_gstin: z.string().default(""),
  bill_date: z.string().min(1),
  due_date: z.string().min(1),
  items: z.array(billLineItemSchema).min(1),
  subtotal_paisa: z.coerce.number().int().nonnegative(),
  cgst_paisa: z.coerce.number().int().nonnegative(),
  sgst_paisa: z.coerce.number().int().nonnegative(),
  total_paisa: z.coerce.number().int().nonnegative(),
  payment_status: z.enum(["pending", "paid", "failed", "refunded", "partial"]).default("pending"),
  paid_amount_paisa: z.coerce.number().int().nonnegative().default(0),
  payments: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        amount_paisa: z.coerce.number().int().nonnegative(),
        date: z.string(),
        mode: z.string().default(""),
        reference: z.string().default(""),
      })
    )
    .default([]),
});

export type CreatePurchaseBillInput = z.infer<typeof CreatePurchaseBillSchema>;

export const RecordBillPaymentSchema = z.object({
  amount: z.coerce.number().int().positive(),
  date: z.string().min(1),
  mode: z.string().default(""),
  reference: z.string().default(""),
});

export type RecordBillPaymentInput = z.infer<typeof RecordBillPaymentSchema>;
