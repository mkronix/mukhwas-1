import { z } from "zod";

export const CreateUnitSchema = z.object({
  name: z.string().min(1).max(100),
  abbreviation: z.string().min(1).max(20),
  type: z.enum(["Weight", "Volume", "Count", "Other"]),
  created_by: z.string().optional(),
});

export type CreateUnitInput = z.infer<typeof CreateUnitSchema>;

export const UpdateUnitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  abbreviation: z.string().min(1).max(20).optional(),
  type: z.enum(["Weight", "Volume", "Count", "Other"]).optional(),
});

export type UpdateUnitInput = z.infer<typeof UpdateUnitSchema>;

export const UnitListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(["Weight", "Volume", "Count", "Other"]).optional(),
  is_system: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
});

export type UnitListQuery = z.infer<typeof UnitListQuerySchema>;

export const CreateConversionSchema = z.object({
  from_unit: z.string().min(1),
  to_unit: z.string().min(1),
  factor: z.number().positive(),
});

export type CreateConversionInput = z.infer<typeof CreateConversionSchema>;

export const UpdateConversionSchema = z.object({
  factor: z.number().positive(),
});

export type UpdateConversionInput = z.infer<typeof UpdateConversionSchema>;

export const ConversionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  from_unit: z.string().optional(),
  to_unit: z.string().optional(),
});

export type ConversionListQuery = z.infer<typeof ConversionListQuerySchema>;

export const IdParamSchema = z.object({
  id: z.string().uuid(),
});
