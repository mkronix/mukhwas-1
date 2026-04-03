import { z } from "zod";

export const SupplierListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(500),
  search: z.string().optional(),
  is_active: z.enum(["true", "false"]).optional(),
});

export type SupplierListQuery = z.infer<typeof SupplierListQuerySchema>;

export const SupplierLedgerQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type SupplierLedgerQuery = z.infer<typeof SupplierLedgerQuerySchema>;

const paymentTerms = z.enum(["immediate", "net_15", "net_30", "net_45", "net_60"]);

export const CreateSupplierSchema = z.object({
  name: z.string().min(1).max(255),
  contact_person: z.string().max(200).default(""),
  phone: z.string().max(30).default(""),
  email: z.string().email().max(255),
  address: z.string().default(""),
  gstin: z.string().max(15).optional().nullable(),
  pan: z.string().max(10).optional().nullable(),
  payment_terms: paymentTerms.default("net_30"),
  is_active: z.boolean().default(true),
  bank_name: z.string().max(200).default(""),
  account_number: z.string().max(50).default(""),
  ifsc_code: z.string().max(20).default(""),
  account_holder: z.string().max(200).default(""),
});

export type CreateSupplierInput = z.infer<typeof CreateSupplierSchema>;

export const UpdateSupplierSchema = CreateSupplierSchema.partial();

export type UpdateSupplierInput = z.infer<typeof UpdateSupplierSchema>;

export const IdParamSchema = z.object({
  id: z.string().uuid(),
});
