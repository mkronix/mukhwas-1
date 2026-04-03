import { describe, it, expect } from "vitest";

const { z } = await import("zod");

const StorefrontRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().max(20).default(""),
});

const StorefrontLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const StorefrontVerifyEmailSchema = z.object({
  token: z.string().min(1),
});

const StorefrontForgotPasswordSchema = z.object({
  email: z.string().email(),
});

const StorefrontResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

const StorefrontChangePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).max(128),
});

const StorefrontGoogleSchema = z.object({
  id_token: z.string().min(1),
});

const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const AdminForgotPasswordSchema = z.object({
  email: z.string().email(),
});

const AdminResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

const AdminChangePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).max(128),
});

const POSLoginSchema = z.object({
  staffId: z.string().min(1),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

const RefreshSchema = z.object({
  refresh_token: z.string().min(1),
  surface: z.enum(["storefront", "admin", "pos"]),
});

describe("Auth Schemas", () => {
  describe("StorefrontRegisterSchema", () => {
    it("accepts valid registration data", () => {
      const result = StorefrontRegisterSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
        phone: "9876543210",
      });
      expect(result.success).toBe(true);
    });

    it("defaults phone to empty string", () => {
      const result = StorefrontRegisterSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
      if (result.success) expect(result.data.phone).toBe("");
    });

    it("rejects name shorter than 2 chars", () => {
      const result = StorefrontRegisterSchema.safeParse({
        name: "J",
        email: "john@example.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid email", () => {
      const result = StorefrontRegisterSchema.safeParse({
        name: "John Doe",
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password shorter than 8 chars", () => {
      const result = StorefrontRegisterSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "short",
      });
      expect(result.success).toBe(false);
    });

    it("rejects password longer than 128 chars", () => {
      const result = StorefrontRegisterSchema.safeParse({
        name: "John Doe",
        email: "john@example.com",
        password: "a".repeat(129),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("StorefrontLoginSchema", () => {
    it("accepts valid login", () => {
      const result = StorefrontLoginSchema.safeParse({
        email: "john@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty password", () => {
      const result = StorefrontLoginSchema.safeParse({
        email: "john@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("StorefrontVerifyEmailSchema", () => {
    it("accepts valid token", () => {
      const result = StorefrontVerifyEmailSchema.safeParse({ token: "abc123" });
      expect(result.success).toBe(true);
    });

    it("rejects empty token", () => {
      const result = StorefrontVerifyEmailSchema.safeParse({ token: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("StorefrontForgotPasswordSchema", () => {
    it("accepts valid email", () => {
      const result = StorefrontForgotPasswordSchema.safeParse({ email: "test@test.com" });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = StorefrontForgotPasswordSchema.safeParse({ email: "bad" });
      expect(result.success).toBe(false);
    });
  });

  describe("StorefrontResetPasswordSchema", () => {
    it("accepts valid reset data", () => {
      const result = StorefrontResetPasswordSchema.safeParse({
        token: "resettoken",
        password: "newpassword123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short password", () => {
      const result = StorefrontResetPasswordSchema.safeParse({
        token: "resettoken",
        password: "short",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("StorefrontChangePasswordSchema", () => {
    it("accepts valid change password data", () => {
      const result = StorefrontChangePasswordSchema.safeParse({
        current_password: "oldpass",
        new_password: "newpassword123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects short new password", () => {
      const result = StorefrontChangePasswordSchema.safeParse({
        current_password: "oldpass",
        new_password: "short",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("StorefrontGoogleSchema", () => {
    it("accepts valid id_token", () => {
      const result = StorefrontGoogleSchema.safeParse({ id_token: "googletoken123" });
      expect(result.success).toBe(true);
    });

    it("rejects empty id_token", () => {
      const result = StorefrontGoogleSchema.safeParse({ id_token: "" });
      expect(result.success).toBe(false);
    });
  });

  describe("AdminLoginSchema", () => {
    it("accepts valid admin login", () => {
      const result = AdminLoginSchema.safeParse({
        email: "admin@mukhwas.com",
        password: "adminpass",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing fields", () => {
      const result = AdminLoginSchema.safeParse({ email: "admin@mukhwas.com" });
      expect(result.success).toBe(false);
    });
  });

  describe("AdminForgotPasswordSchema", () => {
    it("accepts valid email", () => {
      const result = AdminForgotPasswordSchema.safeParse({ email: "admin@mukhwas.com" });
      expect(result.success).toBe(true);
    });
  });

  describe("AdminResetPasswordSchema", () => {
    it("accepts valid reset", () => {
      const result = AdminResetPasswordSchema.safeParse({
        token: "resettoken",
        password: "newpassword123",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("AdminChangePasswordSchema", () => {
    it("accepts valid change", () => {
      const result = AdminChangePasswordSchema.safeParse({
        current_password: "old",
        new_password: "newpassword123",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("POSLoginSchema", () => {
    it("accepts valid POS login", () => {
      const result = POSLoginSchema.safeParse({
        staffId: "staff-uuid-123",
        pin: "1234",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty staffId", () => {
      const result = POSLoginSchema.safeParse({ staffId: "", pin: "1234" });
      expect(result.success).toBe(false);
    });

    it("rejects empty pin", () => {
      const result = POSLoginSchema.safeParse({ staffId: "staff-uuid", pin: "" });
      expect(result.success).toBe(false);
    });

    it("rejects PIN that is not exactly 4 digits", () => {
      expect(POSLoginSchema.safeParse({ staffId: "staff-uuid", pin: "123" }).success).toBe(false);
      expect(POSLoginSchema.safeParse({ staffId: "staff-uuid", pin: "12345" }).success).toBe(false);
      expect(POSLoginSchema.safeParse({ staffId: "staff-uuid", pin: "12ab" }).success).toBe(false);
    });
  });

  describe("RefreshSchema", () => {
    it("accepts valid refresh for storefront", () => {
      const result = RefreshSchema.safeParse({
        refresh_token: "refreshtoken123",
        surface: "storefront",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid refresh for admin", () => {
      const result = RefreshSchema.safeParse({
        refresh_token: "refreshtoken123",
        surface: "admin",
      });
      expect(result.success).toBe(true);
    });

    it("accepts valid refresh for pos", () => {
      const result = RefreshSchema.safeParse({
        refresh_token: "refreshtoken123",
        surface: "pos",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid surface", () => {
      const result = RefreshSchema.safeParse({
        refresh_token: "refreshtoken123",
        surface: "invalid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty refresh token", () => {
      const result = RefreshSchema.safeParse({
        refresh_token: "",
        surface: "admin",
      });
      expect(result.success).toBe(false);
    });
  });
});
