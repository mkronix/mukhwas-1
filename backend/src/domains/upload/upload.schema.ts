import { z } from "zod";

const VALID_FOLDERS = [
  "general",
  "products",
  "categories",
  "staff",
  "customers",
  "recipes",
  "content",
  "invoices",
  "documents",
];

export const UploadQuerySchema = z.object({
  folder: z
    .string()
    .max(50)
    .regex(/^[a-z0-9_-]+$/, "Folder must be lowercase alphanumeric with hyphens/underscores only")
    .refine((val) => VALID_FOLDERS.includes(val), {
      message: `Folder must be one of: ${VALID_FOLDERS.join(", ")}`,
    })
    .default("general"),
});

export type UploadQuery = z.infer<typeof UploadQuerySchema>;

export const DeleteUploadSchema = z.object({
  public_id: z.string().min(1).max(500),
});

export type DeleteUploadInput = z.infer<typeof DeleteUploadSchema>;
