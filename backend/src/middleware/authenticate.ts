import type { Request, Response, NextFunction } from "express";
import { verifyToken, type Surface, type DecodedToken } from "../utils/jwt";
import { ApiError } from "../utils/ApiError";
import { db } from "../database/knex";

function extractToken(req: Request): string {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    throw ApiError.unauthorized("No token provided", "MISSING_TOKEN");
  }
  return authHeader.slice(7);
}

function createAuthMiddleware(surface: Surface) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = extractToken(req);
      const decoded = verifyToken(token, surface);
      const sv = (decoded as Record<string, unknown>).sv as number | undefined;

      if (surface === "storefront") {
        const customer = await db("customers").where({ id: decoded.sub }).first();
        if (!customer) throw ApiError.unauthorized("Customer not found", "ENTITY_NOT_FOUND");

        if (sv !== undefined && customer.session_version !== sv) {
          throw ApiError.unauthorized("Session invalidated", "SESSION_INVALIDATED");
        }

        req.user = { ...decoded, entity: customer, surface };
      } else {
        const staff = await db("staff").where({ id: decoded.sub }).first();
        if (!staff) throw ApiError.unauthorized("Staff not found", "ENTITY_NOT_FOUND");
        if (!staff.is_active) throw ApiError.forbidden("Account is deactivated", "ACCOUNT_DEACTIVATED");
        if (staff.is_locked) throw ApiError.forbidden("Account is locked", "ACCOUNT_LOCKED");

        if (sv !== undefined && staff.session_version !== sv) {
          throw ApiError.unauthorized("Session invalidated", "SESSION_INVALIDATED");
        }

        if (surface === "admin" && staff.admin_access === false) {
          throw ApiError.forbidden("Admin access not granted", "NO_ADMIN_ACCESS");
        }
        if (surface === "pos" && staff.pos_access === false) {
          throw ApiError.forbidden("POS access not granted", "NO_POS_ACCESS");
        }

        req.user = { ...decoded, entity: staff, surface };
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export const authenticateStorefront = createAuthMiddleware("storefront");
export const authenticateAdmin = createAuthMiddleware("admin");
export const authenticatePOS = createAuthMiddleware("pos");

/** Accepts either admin or POS staff JWT for shared /admin/* resource routes. */
export async function authenticateStaffResource(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    for (const surface of ["admin", "pos"] as Surface[]) {
      try {
        const decoded = verifyToken(token, surface);
        const sv = (decoded as Record<string, unknown>).sv as number | undefined;
        const staff = await db("staff").where({ id: decoded.sub }).first();
        if (!staff) continue;
        if (!staff.is_active) {
          return next(ApiError.forbidden("Account is deactivated", "ACCOUNT_DEACTIVATED"));
        }
        if (staff.is_locked) {
          return next(ApiError.forbidden("Account is locked", "ACCOUNT_LOCKED"));
        }
        if (sv !== undefined && staff.session_version !== sv) {
          return next(ApiError.unauthorized("Session invalidated", "SESSION_INVALIDATED"));
        }
        if (surface === "admin" && staff.admin_access === false) continue;
        if (surface === "pos" && staff.pos_access === false) continue;
        req.user = { ...decoded, entity: staff, surface };
        return next();
      } catch {
        continue;
      }
    }
    return next(ApiError.unauthorized("Invalid or expired token", "INVALID_TOKEN"));
  } catch (err) {
    next(err);
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return next(ApiError.unauthorized("No token provided", "MISSING_TOKEN"));
  }

  const token = authHeader.slice(7);
  try {
    for (const surface of ["admin", "pos", "storefront"] as Surface[]) {
      try {
        const decoded = verifyToken(token, surface);
        req.user = { ...decoded, surface };
        return next();
      } catch {
        continue;
      }
    }
    throw ApiError.unauthorized("Invalid or expired token", "INVALID_TOKEN");
  } catch (err) {
    next(err);
  }
}

export function authorize(..._roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());
    next();
  };
}
