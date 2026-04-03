import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { db } from "../database/knex";
import type { ModuleKey, ActionKey } from "../constant/permissions";

const ACTION_COLUMN_MAP: Record<string, string> = {
  read: "can_read",
  create: "can_create",
  update: "can_update",
  delete: "can_delete",
  export: "can_export",
  view_reports: "can_view_reports",
};

export function requirePermission(module: ModuleKey, action: ActionKey) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = req.user as {
        entity?: { role_id?: string; is_developer?: boolean };
        surface?: string;
      } | undefined;
      if (user?.entity?.is_developer === true) {
        return next();
      }
      const roleId = user?.entity?.role_id;
      const surface = user?.surface === "pos" ? "pos" : "admin";

      if (!roleId) {
        return next(ApiError.forbidden("No role assigned", "INSUFFICIENT_PERMISSIONS"));
      }

      const permission = await db("role_permissions")
        .where({ role_id: roleId, module, surface })
        .first();

      if (!permission) {
        return next(ApiError.forbidden(`No access to module: ${module}`, "INSUFFICIENT_PERMISSIONS"));
      }

      const column = ACTION_COLUMN_MAP[action];
      if (column && !permission[column]) {
        return next(
          ApiError.forbidden(`Insufficient permissions: ${module}.${action}`, "INSUFFICIENT_PERMISSIONS")
        );
      }

      if (!column) {
        const extendedActions: string[] = permission.extended_actions ?? [];
        if (!extendedActions.includes(action) && !permission.can_read) {
          return next(
            ApiError.forbidden(`Insufficient permissions: ${module}.${action}`, "INSUFFICIENT_PERMISSIONS")
          );
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requirePOSAccess(req: Request, _res: Response, next: NextFunction): void {
  const user = req.user as {
    entity?: { role_id?: string; pos_access?: boolean; is_developer?: boolean };
  } | undefined;

  if (user?.entity?.is_developer === true) {
    return next();
  }

  if (!user?.entity?.role_id) {
    return next(ApiError.forbidden("No role assigned", "INSUFFICIENT_PERMISSIONS"));
  }

  if (user.entity.pos_access !== true) {
    return next(ApiError.forbidden("POS access not granted", "NO_POS_ACCESS"));
  }

  next();
}
