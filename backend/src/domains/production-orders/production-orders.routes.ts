import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { Action } from "../../constant/permissions";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticatePOS, authenticateStaffResource } from "../../middleware/authenticate";
import { requirePermission, requirePOSAccess } from "../../middleware/permission";
import { ApiError } from "../../utils/ApiError";
import { ProductionOrderController } from "./production-orders.controller";
import {
  CompleteProductionOrderSchema,
  CreateProductionOrderSchema,
  PatchProductionOrderStatusSchema,
  ProductionOrderIdParamSchema,
} from "./production-orders.schema";

function requireProductionOrderStatusPermission(req: Request, res: Response, next: NextFunction) {
  const status = (req.body as { status?: string }).status;
  if (status === "in_progress") {
    return requirePermission("production_orders", Action.START_PRODUCTION)(req, res, next);
  }
  if (status === "cancelled") {
    return requirePermission("production_orders", Action.CANCEL_PRODUCTION)(req, res, next);
  }
  return next(ApiError.unprocessable("Invalid status"));
}

export const adminProductionOrderRouter = Router();
adminProductionOrderRouter.use(authenticateStaffResource);

adminProductionOrderRouter.get(
  "/orders",
  requirePermission("production_orders", "read"),
  asyncHandler(ProductionOrderController.list)
);

adminProductionOrderRouter.get(
  "/stats",
  requirePermission("production_orders", "read"),
  asyncHandler(ProductionOrderController.stats)
);

adminProductionOrderRouter.post(
  "/orders",
  requirePermission("production_orders", "create"),
  validate(CreateProductionOrderSchema, "body"),
  asyncHandler(ProductionOrderController.create)
);

adminProductionOrderRouter.get(
  "/orders/:id",
  requirePermission("production_orders", "read"),
  validate(ProductionOrderIdParamSchema, "params"),
  asyncHandler(ProductionOrderController.getById)
);

adminProductionOrderRouter.patch(
  "/orders/:id/status",
  requireProductionOrderStatusPermission,
  validate(ProductionOrderIdParamSchema, "params"),
  validate(PatchProductionOrderStatusSchema, "body"),
  asyncHandler(ProductionOrderController.patchStatus)
);

adminProductionOrderRouter.post(
  "/orders/:id/complete",
  requirePermission("production_orders", Action.COMPLETE_PRODUCTION),
  validate(ProductionOrderIdParamSchema, "params"),
  validate(CompleteProductionOrderSchema, "body"),
  asyncHandler(ProductionOrderController.complete)
);

export const posProductionOrderRouter = Router();
posProductionOrderRouter.use(authenticatePOS);
posProductionOrderRouter.use(requirePOSAccess);

posProductionOrderRouter.get(
  "/orders",
  requirePermission("production_orders", "read"),
  asyncHandler(ProductionOrderController.list)
);

posProductionOrderRouter.post(
  "/orders",
  requirePermission("production_orders", "create"),
  validate(CreateProductionOrderSchema, "body"),
  asyncHandler(ProductionOrderController.create)
);

posProductionOrderRouter.patch(
  "/orders/:id/status",
  requireProductionOrderStatusPermission,
  validate(ProductionOrderIdParamSchema, "params"),
  validate(PatchProductionOrderStatusSchema, "body"),
  asyncHandler(ProductionOrderController.patchStatus)
);
