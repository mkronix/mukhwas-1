import { describe, it, expect } from "vitest";
import { z } from "zod";

const CreateCategorySchema = z.object({
  name: z.string().min(1).max(200),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  image_url: z.string().url().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

const UpdateCategorySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  slug: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
  sort_order: z.number().int().optional(),
  is_active: z.boolean().optional(),
});

const CategoryFlatQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  parent_id: z.string().uuid().optional(),
  is_active: z.enum(["true", "false"]).optional(),
});

const ReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().uuid(),
    sort_order: z.number().int(),
  })).min(1),
});

const IdParamSchema = z.object({
  id: z.string().uuid(),
});

describe("Categories Schemas", () => {
  describe("CreateCategorySchema", () => {
    it("accepts valid category with defaults", () => {
      const result = CreateCategorySchema.safeParse({ name: "Mukhwas" });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sort_order).toBe(0);
        expect(result.data.is_active).toBe(true);
      }
    });

    it("accepts category with all fields", () => {
      const result = CreateCategorySchema.safeParse({
        name: "Sweet Mukhwas",
        slug: "sweet-mukhwas",
        description: "All sweet varieties",
        image_url: "https://example.com/img.jpg",
        parent_id: "550e8400-e29b-41d4-a716-446655440000",
        sort_order: 5,
        is_active: false,
      });
      expect(result.success).toBe(true);
    });

    it("accepts null parent_id for top-level category", () => {
      const result = CreateCategorySchema.safeParse({
        name: "Top Level",
        parent_id: null,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = CreateCategorySchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });

    it("rejects invalid image_url", () => {
      const result = CreateCategorySchema.safeParse({
        name: "Test",
        image_url: "not-a-url",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid parent_id format", () => {
      const result = CreateCategorySchema.safeParse({
        name: "Test",
        parent_id: "not-a-uuid",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateCategorySchema", () => {
    it("accepts partial update", () => {
      const result = UpdateCategorySchema.safeParse({ name: "Updated" });
      expect(result.success).toBe(true);
    });

    it("accepts null description", () => {
      const result = UpdateCategorySchema.safeParse({ description: null });
      expect(result.success).toBe(true);
    });

    it("accepts null image_url", () => {
      const result = UpdateCategorySchema.safeParse({ image_url: null });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = UpdateCategorySchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("CategoryFlatQuerySchema", () => {
    it("defaults page and limit", () => {
      const result = CategoryFlatQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("accepts all filters", () => {
      const result = CategoryFlatQuerySchema.safeParse({
        search: "sweet",
        parent_id: "550e8400-e29b-41d4-a716-446655440000",
        is_active: "true",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("ReorderSchema", () => {
    it("accepts valid reorder items", () => {
      const result = ReorderSchema.safeParse({
        items: [
          { id: "550e8400-e29b-41d4-a716-446655440000", sort_order: 1 },
          { id: "660e8400-e29b-41d4-a716-446655440001", sort_order: 2 },
        ],
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty items array", () => {
      const result = ReorderSchema.safeParse({ items: [] });
      expect(result.success).toBe(false);
    });

    it("rejects items with non-UUID id", () => {
      const result = ReorderSchema.safeParse({
        items: [{ id: "bad-id", sort_order: 1 }],
      });
      expect(result.success).toBe(false);
    });
  });
});
