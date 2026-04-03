import { z } from "zod";

export const CustomerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  is_verified: z.enum(["true", "false"]).optional(),
  is_from_pos: z.enum(["true", "false"]).optional(),
  is_active: z.enum(["true", "false"]).optional(),
  created_from: z.string().optional(),
  created_to: z.string().optional(),
});

export type CustomerListQuery = z.infer<typeof CustomerListQuerySchema>;

export const UpdateCustomerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  avatar_url: z.string().url().nullable().optional(),
});

export type UpdateCustomerInput = z.infer<typeof UpdateCustomerSchema>;

export const StorefrontUpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
});

export type StorefrontUpdateProfileInput = z.infer<typeof StorefrontUpdateProfileSchema>;

export const CreateAddressSchema = z.object({
  type: z.enum(["home", "work", "other"]).default("home"),
  line1: z.string().min(1).max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().min(1).max(10),
  is_default: z.boolean().default(false),
});

export type CreateAddressInput = z.infer<typeof CreateAddressSchema>;

export const UpdateAddressSchema = z.object({
  type: z.enum(["home", "work", "other"]).optional(),
  line1: z.string().min(1).max(255).optional(),
  line2: z.string().max(255).nullable().optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  pincode: z.string().min(1).max(10).optional(),
  is_default: z.boolean().optional(),
});

export type UpdateAddressInput = z.infer<typeof UpdateAddressSchema>;

export const IdParamSchema = z.object({
  id: z.string().uuid(),
});

export const CustomerOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CustomerOrdersQuery = z.infer<typeof CustomerOrdersQuerySchema>;

export const StatusToggleSchema = z.object({
  is_active: z.boolean(),
});

export type StatusToggleInput = z.infer<typeof StatusToggleSchema>;

export const CreatePosCustomerSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email().max(255),
  phone: z.string().max(20).optional().default(""),
});

export type CreatePosCustomerInput = z.infer<typeof CreatePosCustomerSchema>;
