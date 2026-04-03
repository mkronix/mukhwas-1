import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { Action } from "../../constant/permissions";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticatePOS, authenticateStaffResource } from "../../middleware/authenticate";
import { requirePermission, requirePOSAccess } from "../../middleware/permission";
import { ApiError } from "../../utils/ApiError";
import { PurchaseReturnController } from "./purchase-returns.controller";
import {
  CreatePurchaseReturnSchema,
  PatchPurchaseReturnStatusSchema,
  PurchaseReturnIdParamSchema,
} from "./purchase-returns.schema";

function requirePurchaseReturnStatusPermission(req: Request, res: Response, next: NextFunction) {
  const status = (req.body as { status?: string }).status;
  if (status === "approved" || status === "credited") {
    return requirePermission("purchase_returns", Action.APPROVE_RETURN)(req, res, next);
  }
  if (status === "sent") {
    return requirePermission("purchase_returns", Action.CREATE)(req, res, next);
  }
  if (status === "requested") {
    return requirePermission("purchase_returns", "read")(req, res, next);
  }
  return next(ApiError.unprocessable("Invalid status"));
}

export const adminPurchaseReturnRouter = Router();
adminPurchaseReturnRouter.use(authenticateStaffResource);

adminPurchaseReturnRouter.get(
  "/returns",
  requirePermission("purchase_returns", "read"),
  asyncHandler(PurchaseReturnController.list)
);

adminPurchaseReturnRouter.post(
  "/returns",
  requirePermission("purchase_returns", "create"),
  validate(CreatePurchaseReturnSchema, "body"),
  asyncHandler(PurchaseReturnController.create)
);

adminPurchaseReturnRouter.patch(
  "/returns/:id/status",
  requirePurchaseReturnStatusPermission,
  validate(PurchaseReturnIdParamSchema, "params"),
  validate(PatchPurchaseReturnStatusSchema, "body"),
  asyncHandler(PurchaseReturnController.patchStatus)
);

export const posPurchaseReturnRouter = Router();
posPurchaseReturnRouter.use(authenticatePOS);
posPurchaseReturnRouter.use(requirePOSAccess);

posPurchaseReturnRouter.get(
  "/returns",
  requirePermission("purchase_returns", "read"),
  asyncHandler(PurchaseReturnController.list)
);

posPurchaseReturnRouter.post(
  "/returns",
  requirePermission("purchase_returns", "create"),
  validate(CreatePurchaseReturnSchema, "body"),
  asyncHandler(PurchaseReturnController.create)
);
