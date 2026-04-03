import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticateStaffResource } from "../../middleware/authenticate";
import { requirePermission } from "../../middleware/permission";
import { SupplierController } from "./suppliers.controller";
import {
  SupplierListQuerySchema,
  CreateSupplierSchema,
  UpdateSupplierSchema,
  IdParamSchema,
  SupplierLedgerQuerySchema,
} from "./suppliers.schema";

const router = Router();

router.use(authenticateStaffResource);

router.get(
  "/",
  requirePermission("suppliers", "read"),
  validate(SupplierListQuerySchema, "query"),
  asyncHandler(SupplierController.list)
);

router.post(
  "/",
  requirePermission("suppliers", "create"),
  validate(CreateSupplierSchema, "body"),
  asyncHandler(SupplierController.create)
);

router.get(
  "/:id/ledger",
  requirePermission("suppliers", "read"),
  validate(IdParamSchema, "params"),
  validate(SupplierLedgerQuerySchema, "query"),
  asyncHandler(SupplierController.ledger)
);

router.get(
  "/:id",
  requirePermission("suppliers", "read"),
  validate(IdParamSchema, "params"),
  asyncHandler(SupplierController.getById)
);

router.put(
  "/:id",
  requirePermission("suppliers", "update"),
  validate(IdParamSchema, "params"),
  validate(UpdateSupplierSchema, "body"),
  asyncHandler(SupplierController.update)
);

router.delete(
  "/:id",
  requirePermission("suppliers", "delete"),
  validate(IdParamSchema, "params"),
  asyncHandler(SupplierController.remove)
);

export default router;
