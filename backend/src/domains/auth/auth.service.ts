import { db } from "../../database/knex";
import { ApiError } from "../../utils/ApiError";
import { hashPassword, comparePassword } from "../../utils/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken, type Surface } from "../../utils/jwt";
import jwt from "jsonwebtoken";
import { config } from "../../config/env";
import {
  sendVerificationEmail,
  sendVerificationEmailStrict,
  sendPasswordResetEmail,
  sendStaffPasswordResetEmail,
} from "./auth.email";
import type {
  StorefrontRegisterDto,
  StorefrontLoginDto,
  StorefrontVerifyEmailDto,
  StorefrontForgotPasswordDto,
  StorefrontResetPasswordDto,
  StorefrontChangePasswordDto,
  StorefrontGoogleDto,
  AdminLoginDto,
  AdminForgotPasswordDto,
  AdminResetPasswordDto,
  AdminChangePasswordDto,
  POSLoginDto,
  RefreshDto,
} from "./auth.schema";

const STOREFRONT_VERIFY_URL = "http://localhost:5173/verify-email";
const STOREFRONT_RESET_URL = "http://localhost:5173/reset-password";
const ADMIN_RESET_URL = "http://localhost:5173/admin/reset-password";

function signPurposeToken(payload: { sub: string; purpose: string; sv: number }, expiresIn: string): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, { expiresIn } as jwt.SignOptions);
}

function verifyPurposeToken(token: string, expectedPurpose: string): { sub: string; purpose: string; sv: number } {
  try {
    const decoded = jwt.verify(token, config.JWT_ACCESS_SECRET) as { sub: string; purpose: string; sv: number };
    if (decoded.purpose !== expectedPurpose) {
      throw ApiError.unauthorized("Invalid token purpose", "INVALID_TOKEN");
    }
    return decoded;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized("Token expired", "TOKEN_EXPIRED");
    }
    throw ApiError.unauthorized("Invalid token", "INVALID_TOKEN");
  }
}

function signTokenPair(sub: string, surface: Surface, sessionVersion: number) {
  const payload = { sub, surface, sv: sessionVersion };
  return {
    access_token: signAccessToken(payload),
    refresh_token: signRefreshToken(payload),
  };
}

function formatCustomer(c: Record<string, unknown>) {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    is_verified: c.is_verified,
    is_from_pos: c.is_from_pos === true,
    avatar_url: c.avatar_url || undefined,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

function formatStaff(s: Record<string, unknown>) {
  return {
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    role_id: s.role_id,
    pin_failed_attempts: s.pin_failed_attempts,
    pin_locked_at: s.pin_locked_at,
    is_locked: s.is_locked,
    is_developer: s.is_developer,
    admin_access: s.admin_access === true,
    pos_access: s.pos_access === true,
    avatar_url: s.avatar_url || undefined,
    created_at: s.created_at,
    updated_at: s.updated_at,
  };
}

function buildPermissionsFromRolePerms(
  rolePerms: Record<string, unknown>[],
  surface: "admin" | "pos"
): { module: string; action: string }[] {
  const result: { module: string; action: string }[] = [];
  for (const p of rolePerms) {
    if ((p.surface as string) !== surface) continue;
    const mod = p.module as string;
    if (p.can_read) result.push({ module: mod, action: "read" });
    if (p.can_create) result.push({ module: mod, action: "create" });
    if (p.can_update) result.push({ module: mod, action: "update" });
    if (p.can_delete) result.push({ module: mod, action: "delete" });
    if (p.can_export) result.push({ module: mod, action: "export" });
    if (p.can_view_reports) result.push({ module: mod, action: "view_reports" });

    let extended: unknown = p.extended_actions;
    if (typeof extended === "string") {
      try {
        extended = JSON.parse(extended);
      } catch {
        extended = [];
      }
    }
    if (Array.isArray(extended)) {
      for (const action of extended) {
        if (typeof action === "string") {
          result.push({ module: mod, action });
        }
      }
    }
  }
  return result;
}

export async function storefrontRegister(dto: StorefrontRegisterDto, correlationId?: string) {
  const existing = await db("customers").where({ email: dto.email }).first();
  if (existing) throw ApiError.conflict("Email already registered", "DUPLICATE_ENTRY");

  const password_hash = await hashPassword(dto.password);
  const [customer] = await db("customers")
    .insert({
      name: dto.name,
      email: dto.email,
      password_hash,
      phone: dto.phone,
      is_verified: false,
      is_from_pos: false,
    })
    .returning("*");

  const verificationToken = signPurposeToken(
    { sub: customer.id, purpose: "email_verification", sv: customer.session_version },
    "24h"
  );

  sendVerificationEmail({
    to: customer.email,
    name: customer.name,
    token: verificationToken,
    verifyUrl: STOREFRONT_VERIFY_URL,
    correlationId,
  });

  const tokens = signTokenPair(customer.id, "storefront", customer.session_version);

  return {
    customer: formatCustomer(customer),
    token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  };
}

export async function storefrontLogin(dto: StorefrontLoginDto) {
  const customer = await db("customers").where({ email: dto.email }).first();
  if (!customer) throw ApiError.unauthorized("Invalid credentials", "INVALID_CREDENTIALS");

  const valid = await comparePassword(dto.password, customer.password_hash);
  if (!valid) throw ApiError.unauthorized("Invalid credentials", "INVALID_CREDENTIALS");

  const newVersion = customer.session_version + 1;
  await db("customers").where({ id: customer.id }).update({ session_version: newVersion });

  const tokens = signTokenPair(customer.id, "storefront", newVersion);

  return {
    customer: formatCustomer({ ...customer, session_version: newVersion }),
    token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  };
}

export async function storefrontLogout(customerId: string) {
  await db("customers").where({ id: customerId }).increment("session_version", 1);
}

export async function storefrontVerifyEmail(dto: StorefrontVerifyEmailDto) {
  const decoded = verifyPurposeToken(dto.token, "email_verification");

  const customer = await db("customers").where({ id: decoded.sub }).first();
  if (!customer) throw ApiError.notFound("Customer not found");

  if (customer.session_version !== decoded.sv) {
    throw ApiError.unauthorized("Token invalidated", "SESSION_INVALIDATED");
  }

  await db("customers").where({ id: customer.id }).update({ is_verified: true });

  return { customer: formatCustomer({ ...customer, is_verified: true }) };
}

export async function storefrontResendVerification(customerId: string, correlationId?: string) {
  const customer = await db("customers").where({ id: customerId }).first();
  if (!customer) throw ApiError.notFound("Customer not found");
  if (customer.is_verified) throw ApiError.badRequest("Email already verified", "ALREADY_VERIFIED");

  const verificationToken = signPurposeToken(
    { sub: customer.id, purpose: "email_verification", sv: customer.session_version },
    "24h"
  );

  await sendVerificationEmailStrict({
    to: customer.email,
    name: customer.name,
    token: verificationToken,
    verifyUrl: STOREFRONT_VERIFY_URL,
    correlationId,
  });
}

export async function storefrontForgotPassword(dto: StorefrontForgotPasswordDto, correlationId?: string) {
  const customer = await db("customers").where({ email: dto.email }).first();
  if (!customer) return;

  const resetToken = signPurposeToken(
    { sub: customer.id, purpose: "password_reset", sv: customer.session_version },
    "1h"
  );

  sendPasswordResetEmail({
    to: customer.email,
    name: customer.name,
    token: resetToken,
    resetUrl: STOREFRONT_RESET_URL,
    correlationId,
  });
}

export async function storefrontResetPassword(dto: StorefrontResetPasswordDto) {
  const decoded = verifyPurposeToken(dto.token, "password_reset");

  const customer = await db("customers").where({ id: decoded.sub }).first();
  if (!customer) throw ApiError.notFound("Customer not found");

  if (customer.session_version !== decoded.sv) {
    throw ApiError.unauthorized("Token invalidated", "SESSION_INVALIDATED");
  }

  const password_hash = await hashPassword(dto.password);
  await db("customers")
    .where({ id: customer.id })
    .update({ password_hash, session_version: customer.session_version + 1 });
}

export async function storefrontChangePassword(customerId: string, dto: StorefrontChangePasswordDto) {
  const customer = await db("customers").where({ id: customerId }).first();
  if (!customer) throw ApiError.notFound("Customer not found");

  const valid = await comparePassword(dto.current_password, customer.password_hash);
  if (!valid) throw ApiError.unauthorized("Current password is incorrect", "INVALID_CREDENTIALS");

  const password_hash = await hashPassword(dto.new_password);
  const newVersion = customer.session_version + 1;
  await db("customers").where({ id: customer.id }).update({ password_hash, session_version: newVersion });

  const tokens = signTokenPair(customer.id, "storefront", newVersion);
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  };
}

export async function storefrontGoogleLogin(dto: StorefrontGoogleDto) {
  const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${dto.id_token}`);
  if (!response.ok) throw ApiError.unauthorized("Invalid Google token", "INVALID_TOKEN");

  const payload = (await response.json()) as {
    aud: string;
    email: string;
    name: string;
    picture: string;
    sub: string;
  };

  if (payload.aud !== config.GOOGLE_CLIENT_ID) {
    throw ApiError.unauthorized("Token audience mismatch", "INVALID_TOKEN");
  }

  let customer = await db("customers").where({ google_id: payload.sub }).first();

  if (!customer) {
    customer = await db("customers").where({ email: payload.email }).first();
  }

  if (customer) {
    const newVersion = customer.session_version + 1;
    await db("customers")
      .where({ id: customer.id })
      .update({
        google_id: payload.sub,
        is_verified: true,
        avatar_url: payload.picture || customer.avatar_url,
        name: customer.name || payload.name,
        session_version: newVersion,
      });
    customer = await db("customers").where({ id: customer.id }).first();
  } else {
    const [created] = await db("customers")
      .insert({
        name: payload.name,
        email: payload.email,
        password_hash: "",
        phone: "",
        is_verified: true,
        is_from_pos: false,
        google_id: payload.sub,
        avatar_url: payload.picture || null,
      })
      .returning("*");
    customer = created;
  }

  const tokens = signTokenPair(customer.id, "storefront", customer.session_version);
  return {
    customer: formatCustomer(customer),
    token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  };
}

export async function adminLogin(dto: AdminLoginDto) {
  const staff = await db("staff").where({ email: dto.email }).first();
  if (!staff) throw ApiError.unauthorized("Invalid credentials", "INVALID_CREDENTIALS");
  if (!staff.is_active) throw ApiError.forbidden("Account is deactivated", "ACCOUNT_DEACTIVATED");
  if (staff.is_locked) throw ApiError.forbidden("Account is locked", "ACCOUNT_LOCKED");

  const valid = await comparePassword(dto.password, staff.password_hash);
  if (!valid) throw ApiError.unauthorized("Invalid credentials", "INVALID_CREDENTIALS");

  if (staff.admin_access !== true) {
    throw ApiError.forbidden("Admin access not granted", "NO_ADMIN_ACCESS");
  }

  const newVersion = staff.session_version + 1;
  await db("staff").where({ id: staff.id }).update({ session_version: newVersion });

  const role = await db("roles").where({ id: staff.role_id }).first();
  const rolePerms = await db("role_permissions").where({ role_id: staff.role_id });
  const permissions = buildPermissionsFromRolePerms(rolePerms, "admin");

  const tokens = signTokenPair(staff.id, "admin", newVersion);

  return {
    staff: formatStaff({ ...staff, session_version: newVersion }),
    role,
    permissions,
    token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  };
}

export async function adminLogout(staffId: string) {
  await db("staff").where({ id: staffId }).increment("session_version", 1);
}

export async function adminForgotPassword(dto: AdminForgotPasswordDto, correlationId?: string) {
  const staff = await db("staff").where({ email: dto.email }).first();
  if (!staff || staff.is_developer) return;

  const resetToken = signPurposeToken(
    { sub: staff.id, purpose: "password_reset", sv: staff.session_version },
    "1h"
  );

  sendStaffPasswordResetEmail({
    to: staff.email,
    name: staff.name,
    token: resetToken,
    resetUrl: ADMIN_RESET_URL,
    correlationId,
  });
}

export async function adminResetPassword(dto: AdminResetPasswordDto) {
  const decoded = verifyPurposeToken(dto.token, "password_reset");

  const staff = await db("staff").where({ id: decoded.sub }).first();
  if (!staff) throw ApiError.notFound("Staff not found");

  if (staff.session_version !== decoded.sv) {
    throw ApiError.unauthorized("Token invalidated", "SESSION_INVALIDATED");
  }

  const password_hash = await hashPassword(dto.password);
  await db("staff")
    .where({ id: staff.id })
    .update({ password_hash, session_version: staff.session_version + 1 });
}

export async function adminChangePassword(staffId: string, dto: AdminChangePasswordDto) {
  const staff = await db("staff").where({ id: staffId }).first();
  if (!staff) throw ApiError.notFound("Staff not found");

  const valid = await comparePassword(dto.current_password, staff.password_hash);
  if (!valid) throw ApiError.unauthorized("Current password is incorrect", "INVALID_CREDENTIALS");

  const password_hash = await hashPassword(dto.new_password);
  const newVersion = staff.session_version + 1;
  await db("staff").where({ id: staff.id }).update({ password_hash, session_version: newVersion });

  const tokens = signTokenPair(staff.id, "admin", newVersion);
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  };
}

export async function adminMe(staffId: string) {
  const staff = await db("staff")
    .where({ id: staffId })
    .select(
      "id",
      "name",
      "email",
      "phone",
      "role_id",
      "avatar_url",
      "is_developer",
      "is_locked",
      "pin_failed_attempts",
      "pin_locked_at",
      "admin_access",
      "pos_access",
      "created_at",
      "updated_at"
    )
    .first();

  if (!staff) throw ApiError.notFound("Staff not found");

  const role = await db("roles").where({ id: staff.role_id }).first();
  const rolePerms = await db("role_permissions").where({ role_id: staff.role_id });
  const permissions = buildPermissionsFromRolePerms(rolePerms, "admin");

  return {
    staff: formatStaff(staff),
    role,
    permissions,
  };
}

export async function posGetStaffList() {
  const staffWithRoles = await db("staff")
    .join("roles", "staff.role_id", "roles.id")
    .where("staff.is_active", true)
    .where("staff.is_developer", false)
    .where("staff.pos_access", true)
    .whereNotNull("staff.pin_hash")
    .select(
      "staff.id",
      "staff.name",
      "staff.email",
      "staff.avatar_url",
      "staff.role_id",
      "roles.name as role_name"
    );

  return staffWithRoles.map((s: Record<string, unknown>) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    avatar_url: s.avatar_url || undefined,
    role_id: s.role_id,
    role_name: s.role_name,
  }));
}

export async function posLogin(dto: POSLoginDto) {
  const staff = await db("staff").where({ id: dto.staffId }).first();
  if (!staff) throw ApiError.unauthorized("Staff not found", "INVALID_CREDENTIALS");
  if (!staff.is_active) throw ApiError.forbidden("Account is deactivated", "ACCOUNT_DEACTIVATED");

  const role = await db("roles").where({ id: staff.role_id }).first();
  if (staff.pos_access !== true) throw ApiError.forbidden("No POS access", "FORBIDDEN");

  const lockoutConfig = { maxAttempts: 5, lockoutMinutes: 15 };

  if (staff.pin_locked_at) {
    const lockedAt = new Date(staff.pin_locked_at).getTime();
    const lockedUntil = lockedAt + lockoutConfig.lockoutMinutes * 60 * 1000;
    if (Date.now() < lockedUntil) {
      throw ApiError.tooManyRequests("Account locked due to too many failed attempts", "PIN_LOCKED", {
        locked_until: lockedUntil,
        attempts: staff.pin_failed_attempts,
        max_attempts: lockoutConfig.maxAttempts,
      });
    }
    await db("staff").where({ id: staff.id }).update({ pin_locked_at: null, pin_failed_attempts: 0 });
  }

  if (!staff.pin_hash) throw ApiError.unauthorized("PIN not set", "INVALID_CREDENTIALS");

  const validPin = await comparePassword(dto.pin, staff.pin_hash);
  if (!validPin) {
    const newAttempts = staff.pin_failed_attempts + 1;
    const updates: Record<string, unknown> = { pin_failed_attempts: newAttempts };

    if (newAttempts >= lockoutConfig.maxAttempts) {
      updates.pin_locked_at = new Date().toISOString();
      const lockedUntil = Date.now() + lockoutConfig.lockoutMinutes * 60 * 1000;
      await db("staff").where({ id: staff.id }).update(updates);
      throw ApiError.tooManyRequests("Account locked", "PIN_LOCKED", {
        locked_until: lockedUntil,
        attempts: newAttempts,
        max_attempts: lockoutConfig.maxAttempts,
      });
    }

    await db("staff").where({ id: staff.id }).update(updates);
    throw ApiError.unauthorized("Incorrect PIN", "INVALID_CREDENTIALS", {
      attempts: newAttempts,
      max_attempts: lockoutConfig.maxAttempts,
    });
  }

  const newVersion = staff.session_version + 1;
  await db("staff").where({ id: staff.id }).update({
    pin_failed_attempts: 0,
    pin_locked_at: null,
    session_version: newVersion,
  });

  const rolePerms = await db("role_permissions").where({ role_id: staff.role_id });
  const permissions = buildPermissionsFromRolePerms(rolePerms, "pos");

  const sessionId = `session_${Date.now()}`;
  const sessionStartTime = new Date().toISOString();
  const tokens = signTokenPair(staff.id, "pos", newVersion);

  return {
    staff: formatStaff({ ...staff, session_version: newVersion, pin_failed_attempts: 0, pin_locked_at: null }),
    role,
    permissions,
    sessionId,
    sessionStartTime,
    token: tokens.access_token,
    refresh_token: tokens.refresh_token,
  };
}

export async function posLogout(staffId: string) {
  await db("staff").where({ id: staffId }).increment("session_version", 1);
}

export async function posMe(staffId: string) {
  const staff = await db("staff")
    .where({ id: staffId })
    .select(
      "id",
      "name",
      "email",
      "phone",
      "role_id",
      "avatar_url",
      "is_developer",
      "is_locked",
      "pin_failed_attempts",
      "pin_locked_at",
      "admin_access",
      "pos_access",
      "created_at",
      "updated_at"
    )
    .first();

  if (!staff) throw ApiError.notFound("Staff not found");

  const role = await db("roles").where({ id: staff.role_id }).first();
  const rolePerms = await db("role_permissions").where({ role_id: staff.role_id });
  const permissions = buildPermissionsFromRolePerms(rolePerms, "pos");

  return { staff: formatStaff(staff), role, permissions };
}

export async function refreshTokens(dto: RefreshDto) {
  const decoded = verifyRefreshToken(dto.refresh_token, dto.surface as Surface);

  const sv = (decoded as Record<string, unknown>).sv as number | undefined;

  if (dto.surface === "storefront") {
    const customer = await db("customers").where({ id: decoded.sub }).first();
    if (!customer) throw ApiError.unauthorized("Invalid refresh token", "INVALID_TOKEN");

    if (sv !== undefined && customer.session_version !== sv) {
      throw ApiError.unauthorized("Session invalidated", "SESSION_INVALIDATED");
    }

    const newVersion = customer.session_version + 1;
    await db("customers").where({ id: customer.id }).update({ session_version: newVersion });

    const tokens = signTokenPair(customer.id, "storefront", newVersion);
    return { access_token: tokens.access_token, refresh_token: tokens.refresh_token };
  }

  const staff = await db("staff").where({ id: decoded.sub }).first();
  if (!staff || !staff.is_active) throw ApiError.unauthorized("Invalid refresh token", "INVALID_TOKEN");

  if (sv !== undefined && staff.session_version !== sv) {
    throw ApiError.unauthorized("Session invalidated", "SESSION_INVALIDATED");
  }

  const surface = dto.surface as "admin" | "pos";
  if (surface === "admin" && staff.admin_access !== true) {
    throw ApiError.unauthorized("Invalid refresh token", "INVALID_TOKEN");
  }
  if (surface === "pos" && staff.pos_access !== true) {
    throw ApiError.unauthorized("Invalid refresh token", "INVALID_TOKEN");
  }
  const newVersion = staff.session_version + 1;
  await db("staff").where({ id: staff.id }).update({ session_version: newVersion });

  const tokens = signTokenPair(staff.id, surface, newVersion);
  return { access_token: tokens.access_token, refresh_token: tokens.refresh_token };
}
