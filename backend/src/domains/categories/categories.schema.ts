import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;

export const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;

export const CategoryFlatQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  is_active: z.enum(["true", "false"]).optional(),
});

export type CategoryFlatQuery = z.infer<typeof CategoryFlatQuerySchema>;

export const ReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    sort_order: z.number().int(),
  })).min(1),
});

export type ReorderInput = z.infer<typeof ReorderSchema>;

export const IdParamSchema = z.object({
  id: z.string().uuid(),
});
