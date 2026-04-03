import { z } from "zod";

export const StorefrontRegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(128),
  phone: z.string().max(20).default(""),
});

export const StorefrontLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const StorefrontVerifyEmailSchema = z.object({
  token: z.string().min(1),
});

export const StorefrontForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const StorefrontResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const StorefrontChangePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).max(128),
});

export const StorefrontGoogleSchema = z.object({
  id_token: z.string().min(1),
});

export const AdminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const AdminForgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const AdminResetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8).max(128),
});

export const AdminChangePasswordSchema = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).max(128),
});

export const POSLoginSchema = z.object({
  staffId: z.string().min(1),
  pin: z.string().regex(/^\d{4}$/, "PIN must be exactly 4 digits"),
});

export const RefreshSchema = z.object({
  refresh_token: z.string().min(1),
  surface: z.enum(["storefront", "admin", "pos"]),
});

export type StorefrontRegisterDto = z.infer<typeof StorefrontRegisterSchema>;
export type StorefrontLoginDto = z.infer<typeof StorefrontLoginSchema>;
export type StorefrontVerifyEmailDto = z.infer<typeof StorefrontVerifyEmailSchema>;
export type StorefrontForgotPasswordDto = z.infer<typeof StorefrontForgotPasswordSchema>;
export type StorefrontResetPasswordDto = z.infer<typeof StorefrontResetPasswordSchema>;
export type StorefrontChangePasswordDto = z.infer<typeof StorefrontChangePasswordSchema>;
export type StorefrontGoogleDto = z.infer<typeof StorefrontGoogleSchema>;
export type AdminLoginDto = z.infer<typeof AdminLoginSchema>;
export type AdminForgotPasswordDto = z.infer<typeof AdminForgotPasswordSchema>;
export type AdminResetPasswordDto = z.infer<typeof AdminResetPasswordSchema>;
export type AdminChangePasswordDto = z.infer<typeof AdminChangePasswordSchema>;
export type POSLoginDto = z.infer<typeof POSLoginSchema>;
export type RefreshDto = z.infer<typeof RefreshSchema>;
