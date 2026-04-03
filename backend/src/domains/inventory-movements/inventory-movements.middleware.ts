import type { Request, Response, NextFunction } from "express";
import { db } from "../../database/knex";
import { ApiError } from "../../utils/ApiError";

async function roleSurface(req: Request) {
  const user = req.user as { entity?: { role_id?: string }; surface?: string } | undefined;
  const roleId = user?.entity?.role_id;
  const surface = user?.surface === "pos" ? "pos" : "admin";
  return { roleId, surface };
}

export async function requireInventoryLogRead(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as { entity?: { is_developer?: boolean } } | undefined;
    if (user?.entity?.is_developer === true) {
      next();
      return;
    }
    const { roleId, surface } = await roleSurface(req);
    if (!roleId) {
      next(ApiError.forbidden("No role assigned", "INSUFFICIENT_PERMISSIONS"));
      return;
    }
    const fg = await db("role_permissions")
      .where({ role_id: roleId, module: "inventory_finished", surface })
      .first();
    const rw = await db("role_permissions")
      .where({ role_id: roleId, module: "inventory_raw", surface })
      .first();
    if (!(fg?.can_read || rw?.can_read)) {
      next(ApiError.forbidden("Insufficient permissions", "INSUFFICIENT_PERMISSIONS"));
      return;
    }
    next();
  } catch (e) {
    next(e);
  }
}

export async function requireInventoryLogExport(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user as { entity?: { is_developer?: boolean } } | undefined;
    if (user?.entity?.is_developer === true) {
      next();
      return;
    }
    const { roleId, surface } = await roleSurface(req);
    if (!roleId) {
      next(ApiError.forbidden("No role assigned", "INSUFFICIENT_PERMISSIONS"));
      return;
    }
    const fg = await db("role_permissions")
      .where({ role_id: roleId, module: "inventory_finished", surface })
      .first();
    const rw = await db("role_permissions")
      .where({ role_id: roleId, module: "inventory_raw", surface })
      .first();
    if (!(fg?.can_export || rw?.can_export)) {
      next(ApiError.forbidden("Insufficient permissions", "INSUFFICIENT_PERMISSIONS"));
      return;
    }
    next();
  } catch (e) {
    next(e);
  }
}
