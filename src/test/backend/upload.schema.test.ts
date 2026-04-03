import { describe, it, expect } from "vitest";
import { z } from "zod";

const VALID_FOLDERS = [
  "general", "products", "categories", "staff", "customers",
  "recipes", "content", "invoices", "documents",
];

const UploadQuerySchema = z.object({
  folder: z
    .string()
    .max(50)
    .regex(/^[a-z0-9_-]+$/, "Folder must be lowercase alphanumeric with hyphens/underscores only")
    .refine((val) => VALID_FOLDERS.includes(val), {
      message: `Folder must be one of: ${VALID_FOLDERS.join(", ")}`,
    })
    .default("general"),
});

const DeleteUploadSchema = z.object({
  public_id: z.string().min(1).max(500),
});

describe("Upload Schemas", () => {
  describe("UploadQuerySchema", () => {
    it("defaults folder to general", () => {
      const result = UploadQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.folder).toBe("general");
    });

    it("accepts valid folder names", () => {
      for (const folder of VALID_FOLDERS) {
        const result = UploadQuerySchema.safeParse({ folder });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid folder name", () => {
      const result = UploadQuerySchema.safeParse({ folder: "invalid-folder-name" });
      expect(result.success).toBe(false);
    });

    it("rejects folder with uppercase", () => {
      const result = UploadQuerySchema.safeParse({ folder: "Products" });
      expect(result.success).toBe(false);
    });

    it("rejects folder with spaces", () => {
      const result = UploadQuerySchema.safeParse({ folder: "my folder" });
      expect(result.success).toBe(false);
    });

    it("rejects folder with special characters", () => {
      const result = UploadQuerySchema.safeParse({ folder: "../etc" });
      expect(result.success).toBe(false);
    });

    it("rejects folder with path traversal", () => {
      const result = UploadQuerySchema.safeParse({ folder: "../../secrets" });
      expect(result.success).toBe(false);
    });

    it("rejects folder over 50 chars", () => {
      const result = UploadQuerySchema.safeParse({ folder: "a".repeat(51) });
      expect(result.success).toBe(false);
    });
  });

  describe("DeleteUploadSchema", () => {
    it("accepts valid public_id", () => {
      const result = DeleteUploadSchema.safeParse({ public_id: "mukhwas/products/abc123" });
      expect(result.success).toBe(true);
    });

    it("rejects empty public_id", () => {
      const result = DeleteUploadSchema.safeParse({ public_id: "" });
      expect(result.success).toBe(false);
    });

    it("rejects public_id over 500 chars", () => {
      const result = DeleteUploadSchema.safeParse({ public_id: "x".repeat(501) });
      expect(result.success).toBe(false);
    });

    it("rejects missing public_id", () => {
      const result = DeleteUploadSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
