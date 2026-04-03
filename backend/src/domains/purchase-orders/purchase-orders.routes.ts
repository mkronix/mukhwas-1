import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { Action } from "../../constant/permissions";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticatePOS, authenticateStaffResource } from "../../middleware/authenticate";
import { requirePermission, requirePOSAccess } from "../../middleware/permission";
import { ApiError } from "../../utils/ApiError";
import { PurchaseOrderController } from "./purchase-orders.controller";
import {
  CreatePurchaseOrderSchema,
  PatchPurchaseOrderStatusSchema,
  PurchaseOrderIdParamSchema,
  PutPosPurchaseOrderSchema,
} from "./purchase-orders.schema";

function requirePurchaseOrderStatusPermission(req: Request, res: Response, next: NextFunction) {
  const status = (req.body as { status?: string }).status;
  if (status === "sent") {
    return requirePermission("purchase_orders", Action.SEND_PURCHASE_ORDER)(req, res, next);
  }
  if (status === "received") {
    return requirePermission("purchase_orders", Action.RECEIVE_GOODS)(req, res, next);
  }
  if (status === "billed") {
    return requirePermission("purchase_orders", Action.GENERATE_BILL)(req, res, next);
  }
  if (status === "cancelled") {
    return requirePermission("purchase_orders", Action.CANCEL_ORDER)(req, res, next);
  }
  if (status === "draft") {
    return requirePermission("purchase_orders", Action.UPDATE)(req, res, next);
  }
  return next(ApiError.unprocessable("Invalid status"));
}

export const adminPurchaseOrderRouter = Router();
adminPurchaseOrderRouter.use(authenticateStaffResource);

adminPurchaseOrderRouter.get(
  "/orders",
  requirePermission("purchase_orders", "read"),
  asyncHandler(PurchaseOrderController.list)
);

adminPurchaseOrderRouter.get(
  "/orders/:id",
  requirePermission("purchase_orders", "read"),
  validate(PurchaseOrderIdParamSchema, "params"),
  asyncHandler(PurchaseOrderController.getById)
);

adminPurchaseOrderRouter.post(
  "/orders",
  requirePermission("purchase_orders", "create"),
  validate(CreatePurchaseOrderSchema, "body"),
  asyncHandler(PurchaseOrderController.create)
);

adminPurchaseOrderRouter.patch(
  "/orders/:id/status",
  requirePurchaseOrderStatusPermission,
  validate(PurchaseOrderIdParamSchema, "params"),
  validate(PatchPurchaseOrderStatusSchema, "body"),
  asyncHandler(PurchaseOrderController.patchStatus)
);

export const posPurchaseOrderRouter = Router();
posPurchaseOrderRouter.use(authenticatePOS);
posPurchaseOrderRouter.use(requirePOSAccess);

posPurchaseOrderRouter.get(
  "/orders",
  requirePermission("purchase_orders", "read"),
  asyncHandler(PurchaseOrderController.list)
);

posPurchaseOrderRouter.post(
  "/orders",
  requirePermission("purchase_orders", "create"),
  validate(CreatePurchaseOrderSchema, "body"),
  asyncHandler(PurchaseOrderController.create)
);

posPurchaseOrderRouter.put(
  "/orders/:id",
  requirePermission("purchase_orders", "update"),
  validate(PurchaseOrderIdParamSchema, "params"),
  validate(PutPosPurchaseOrderSchema, "body"),
  asyncHandler(PurchaseOrderController.putPos)
);
