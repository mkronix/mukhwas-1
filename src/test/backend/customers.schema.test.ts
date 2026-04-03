import { describe, it, expect } from "vitest";
import { z } from "zod";

const CustomerListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  is_verified: z.enum(["true", "false"]).optional(),
  is_active: z.enum(["true", "false"]).optional(),
  created_from: z.string().optional(),
  created_to: z.string().optional(),
});

const UpdateCustomerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
  avatar_url: z.string().url().nullable().optional(),
});

const StorefrontUpdateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional(),
});

const CreateAddressSchema = z.object({
  type: z.enum(["home", "work", "other"]).default("home"),
  line1: z.string().min(1).max(255),
  line2: z.string().max(255).optional(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  pincode: z.string().min(1).max(10),
  is_default: z.boolean().default(false),
});

const UpdateAddressSchema = z.object({
  type: z.enum(["home", "work", "other"]).optional(),
  line1: z.string().min(1).max(255).optional(),
  line2: z.string().max(255).nullable().optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  pincode: z.string().min(1).max(10).optional(),
  is_default: z.boolean().optional(),
});

const StatusToggleSchema = z.object({
  is_active: z.boolean(),
});

describe("Customers Schemas", () => {
  describe("CustomerListQuerySchema", () => {
    it("defaults page and limit", () => {
      const result = CustomerListQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.limit).toBe(20);
      }
    });

    it("accepts all filters", () => {
      const result = CustomerListQuerySchema.safeParse({
        search: "john",
        is_verified: "true",
        is_active: "false",
        created_from: "2024-01-01",
        created_to: "2024-12-31",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("UpdateCustomerSchema", () => {
    it("accepts partial update", () => {
      const result = UpdateCustomerSchema.safeParse({ name: "John Updated" });
      expect(result.success).toBe(true);
    });

    it("accepts null avatar_url", () => {
      const result = UpdateCustomerSchema.safeParse({ avatar_url: null });
      expect(result.success).toBe(true);
    });

    it("rejects invalid avatar_url", () => {
      const result = UpdateCustomerSchema.safeParse({ avatar_url: "not-a-url" });
      expect(result.success).toBe(false);
    });

    it("rejects empty name", () => {
      const result = UpdateCustomerSchema.safeParse({ name: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("StorefrontUpdateProfileSchema", () => {
    it("accepts name update", () => {
      const result = StorefrontUpdateProfileSchema.safeParse({ name: "New Name" });
      expect(result.success).toBe(true);
    });

    it("accepts phone update", () => {
      const result = StorefrontUpdateProfileSchema.safeParse({ phone: "9876543210" });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = StorefrontUpdateProfileSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("CreateAddressSchema", () => {
    it("accepts valid address with defaults", () => {
      const result = CreateAddressSchema.safeParse({
        line1: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe("home");
        expect(result.data.is_default).toBe(false);
      }
    });

    it("accepts all fields", () => {
      const result = CreateAddressSchema.safeParse({
        type: "work",
        line1: "456 Office Park",
        line2: "Floor 3",
        city: "Bangalore",
        state: "Karnataka",
        pincode: "560001",
        is_default: true,
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty line1", () => {
      const result = CreateAddressSchema.safeParse({
        line1: "",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty city", () => {
      const result = CreateAddressSchema.safeParse({
        line1: "123 Main St",
        city: "",
        state: "Maharashtra",
        pincode: "400001",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid address type", () => {
      const result = CreateAddressSchema.safeParse({
        type: "invalid",
        line1: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("UpdateAddressSchema", () => {
    it("accepts partial update", () => {
      const result = UpdateAddressSchema.safeParse({ city: "Delhi" });
      expect(result.success).toBe(true);
    });

    it("accepts null line2", () => {
      const result = UpdateAddressSchema.safeParse({ line2: null });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = UpdateAddressSchema.safeParse({});
      expect(result.success).toBe(true);
    });
  });

  describe("StatusToggleSchema", () => {
    it("accepts true", () => {
      const result = StatusToggleSchema.safeParse({ is_active: true });
      expect(result.success).toBe(true);
    });

    it("accepts false", () => {
      const result = StatusToggleSchema.safeParse({ is_active: false });
      expect(result.success).toBe(true);
    });

    it("rejects non-boolean", () => {
      const result = StatusToggleSchema.safeParse({ is_active: "true" });
      expect(result.success).toBe(false);
    });

    it("rejects missing field", () => {
      const result = StatusToggleSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
