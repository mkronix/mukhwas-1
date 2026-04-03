import { describe, it, expect } from "vitest";
import { z } from "zod";

const RawMaterialListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  supplier: z.string().optional(),
  gst_slab: z.enum(["0", "5", "12", "18", "28"]).optional(),
  is_active: z.enum(["true", "false"]).optional(),
});

const CreateRawMaterialSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().default(""),
  unit_id: z.string().uuid(),
  current_stock: z.number().min(0).default(0),
  reorder_level: z.number().min(0).default(0),
  preferred_supplier_id: z.string().nullable().optional(),
  hsn_code: z.string().min(1).max(20),
  gst_slab: z.enum(["0", "5", "12", "18", "28"]),
  cost_per_unit_paisa: z.number().int().min(0).default(0),
});

const UpdateRawMaterialSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  unit_id: z.string().uuid().optional(),
  reorder_level: z.number().min(0).optional(),
  preferred_supplier_id: z.string().nullable().optional(),
  hsn_code: z.string().min(1).max(20).optional(),
  gst_slab: z.enum(["0", "5", "12", "18", "28"]).optional(),
  cost_per_unit_paisa: z.number().int().min(0).optional(),
});

const LinkSupplierSchema = z.object({
  supplier_id: z.string().min(1),
  is_preferred: z.boolean().default(false),
});

const MovementQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

describe("Raw Materials Schemas", () => {
  describe("RawMaterialListQuerySchema", () => {
    it("defaults page and limit", () => {
      const result = RawMaterialListQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("accepts all filters", () => {
      const result = RawMaterialListQuerySchema.safeParse({
        search: "saunf",
        supplier: "supplier-123",
        gst_slab: "18",
        is_active: "true",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid gst_slab", () => {
      const result = RawMaterialListQuerySchema.safeParse({ gst_slab: "15" });
      expect(result.success).toBe(false);
    });
  });

  describe("CreateRawMaterialSchema", () => {
    it("accepts valid raw material", () => {
      const result = CreateRawMaterialSchema.safeParse({
        name: "Saunf Seeds",
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        hsn_code: "0909",
        gst_slab: "5",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("");
        expect(result.data.current_stock).toBe(0);
        expect(result.data.reorder_level).toBe(0);
        expect(result.data.cost_per_unit_paisa).toBe(0);
      }
    });

    it("accepts all fields", () => {
      const result = CreateRawMaterialSchema.safeParse({
        name: "Saunf Seeds",
        description: "Premium quality fennel seeds",
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        current_stock: 500,
        reorder_level: 100,
        preferred_supplier_id: null,
        hsn_code: "0909",
        gst_slab: "5",
        cost_per_unit_paisa: 15000,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = CreateRawMaterialSchema.safeParse({
        name: "",
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        hsn_code: "0909",
        gst_slab: "5",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid unit_id", () => {
      const result = CreateRawMaterialSchema.safeParse({
        name: "Test",
        unit_id: "not-uuid",
        hsn_code: "0909",
        gst_slab: "5",
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative stock", () => {
      const result = CreateRawMaterialSchema.safeParse({
        name: "Test",
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        hsn_code: "0909",
        gst_slab: "5",
        current_stock: -1,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid gst_slab value", () => {
      const result = CreateRawMaterialSchema.safeParse({
        name: "Test",
        unit_id: "550e8400-e29b-41d4-a716-446655440000",
        hsn_code: "0909",
        gst_slab: "15",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateRawMaterialSchema", () => {
    it("accepts partial update", () => {
      const result = UpdateRawMaterialSchema.safeParse({ name: "Updated Name" });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = UpdateRawMaterialSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("accepts null preferred_supplier_id", () => {
      const result = UpdateRawMaterialSchema.safeParse({ preferred_supplier_id: null });
      expect(result.success).toBe(true);
    });
  });

  describe("LinkSupplierSchema", () => {
    it("accepts valid supplier link", () => {
      const result = LinkSupplierSchema.safeParse({
        supplier_id: "supplier-123",
        is_preferred: true,
      });
      expect(result.success).toBe(true);
    });

    it("defaults is_preferred to false", () => {
      const result = LinkSupplierSchema.safeParse({ supplier_id: "supplier-123" });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.is_preferred).toBe(false);
    });

    it("rejects empty supplier_id", () => {
      const result = LinkSupplierSchema.safeParse({ supplier_id: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("MovementQuerySchema", () => {
    it("defaults page and limit", () => {
      const result = MovementQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });
  });
});
