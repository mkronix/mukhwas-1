import { describe, it, expect } from "vitest";
import { z } from "zod";

const CreateUnitSchema = z.object({
  name: z.string().min(1).max(100),
  abbreviation: z.string().min(1).max(20),
  type: z.enum(["Weight", "Volume", "Count", "Other"]),
  created_by: z.string().optional(),
});

const UpdateUnitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  abbreviation: z.string().min(1).max(20).optional(),
  type: z.enum(["Weight", "Volume", "Count", "Other"]).optional(),
});

const UnitListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(["Weight", "Volume", "Count", "Other"]).optional(),
  is_system: z.enum(["true", "false"]).optional(),
  search: z.string().optional(),
});

const CreateConversionSchema = z.object({
  from_unit: z.string().min(1),
  to_unit: z.string().min(1),
  factor: z.number().positive(),
});

const UpdateConversionSchema = z.object({
  factor: z.number().positive(),
});

const IdParamSchema = z.object({
  id: z.string().uuid(),
});

describe("Units Schemas", () => {
  describe("CreateUnitSchema", () => {
    it("accepts valid unit", () => {
      const result = CreateUnitSchema.safeParse({
        name: "Quintal",
        abbreviation: "qtl",
        type: "Weight",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = CreateUnitSchema.safeParse({
        name: "",
        abbreviation: "qtl",
        type: "Weight",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid type", () => {
      const result = CreateUnitSchema.safeParse({
        name: "Quintal",
        abbreviation: "qtl",
        type: "InvalidType",
      });
      expect(result.success).toBe(false);
    });

    it("accepts optional created_by", () => {
      const result = CreateUnitSchema.safeParse({
        name: "Quintal",
        abbreviation: "qtl",
        type: "Weight",
        created_by: "user-123",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("UpdateUnitSchema", () => {
    it("accepts partial update", () => {
      const result = UpdateUnitSchema.safeParse({ name: "Updated Name" });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = UpdateUnitSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("UnitListQuerySchema", () => {
    it("defaults page and limit", () => {
      const result = UnitListQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("coerces string page to number", () => {
      const result = UnitListQuerySchema.safeParse({ page: "3" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.page).toBe(3);
    });

    it("rejects page less than 1", () => {
      const result = UnitListQuerySchema.safeParse({ page: 0 });
      expect(result.success).toBe(false);
    });

    it("rejects limit over 100", () => {
      const result = UnitListQuerySchema.safeParse({ limit: 200 });
      expect(result.success).toBe(false);
    });

    it("accepts type filter", () => {
      const result = UnitListQuerySchema.safeParse({ type: "Weight" });
      expect(result.success).toBe(true);
    });

    it("accepts is_system filter", () => {
      const result = UnitListQuerySchema.safeParse({ is_system: "true" });
      expect(result.success).toBe(true);
    });
  });

  describe("CreateConversionSchema", () => {
    it("accepts valid conversion", () => {
      const result = CreateConversionSchema.safeParse({
        from_unit: "kg",
        to_unit: "g",
        factor: 1000,
      });
      expect(result.success).toBe(true);
    });

    it("rejects zero factor", () => {
      const result = CreateConversionSchema.safeParse({
        from_unit: "kg",
        to_unit: "g",
        factor: 0,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative factor", () => {
      const result = CreateConversionSchema.safeParse({
        from_unit: "kg",
        to_unit: "g",
        factor: -1,
      });
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateConversionSchema", () => {
    it("accepts valid factor", () => {
      const result = UpdateConversionSchema.safeParse({ factor: 500 });
      expect(result.success).toBe(true);
    });
  });

  describe("IdParamSchema", () => {
    it("accepts valid UUID", () => {
      const result = IdParamSchema.safeParse({ id: "550e8400-e29b-41d4-a716-446655440000" });
      expect(result.success).toBe(true);
    });

    it("rejects non-UUID string", () => {
      const result = IdParamSchema.safeParse({ id: "not-a-uuid" });
      expect(result.success).toBe(false);
    });
  });
});
