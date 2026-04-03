import { Router } from "express";
import { Action } from "../../constant/permissions";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticateStaffResource } from "../../middleware/authenticate";
import { requirePermission } from "../../middleware/permission";
import { PurchaseBillController } from "./purchase-bills.controller";
import {
  CreatePurchaseBillSchema,
  PurchaseBillIdParamSchema,
  RecordBillPaymentSchema,
} from "./purchase-bills.schema";

export const adminPurchaseBillRouter = Router();
adminPurchaseBillRouter.use(authenticateStaffResource);

adminPurchaseBillRouter.get(
  "/bills",
  requirePermission("purchase_bills", "read"),
  asyncHandler(PurchaseBillController.list)
);

adminPurchaseBillRouter.get(
  "/bills/:id",
  requirePermission("purchase_bills", "read"),
  validate(PurchaseBillIdParamSchema, "params"),
  asyncHandler(PurchaseBillController.getById)
);

adminPurchaseBillRouter.post(
  "/bills",
  requirePermission("purchase_bills", "create"),
  validate(CreatePurchaseBillSchema, "body"),
  asyncHandler(PurchaseBillController.create)
);

adminPurchaseBillRouter.post(
  "/bills/:id/payments",
  requirePermission("purchase_bills", Action.RECORD_PAYMENT),
  validate(PurchaseBillIdParamSchema, "params"),
  validate(RecordBillPaymentSchema, "body"),
  asyncHandler(PurchaseBillController.recordPayment)
);
