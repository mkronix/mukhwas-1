import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticateStaffResource } from "../../middleware/authenticate";
import { requirePermission } from "../../middleware/permission";
import { RawMaterialController } from "./raw-materials.controller";
import {
  RawMaterialListQuerySchema,
  CreateRawMaterialSchema,
  UpdateRawMaterialSchema,
  IdParamSchema,
  LinkSupplierSchema,
  SupplierUnlinkParamSchema,
  MovementQuerySchema,
} from "./raw-materials.schema";

const router = Router();

router.use(authenticateStaffResource);

router.get(
  "/",
  requirePermission("raw_materials", "read"),
  validate(RawMaterialListQuerySchema, "query"),
  asyncHandler(RawMaterialController.list)
);

router.get(
  "/:id",
  requirePermission("raw_materials", "read"),
  validate(IdParamSchema, "params"),
  asyncHandler(RawMaterialController.getById)
);

router.post(
  "/",
  requirePermission("raw_materials", "create"),
  validate(CreateRawMaterialSchema, "body"),
  asyncHandler(RawMaterialController.create)
);

router.put(
  "/:id",
  requirePermission("raw_materials", "update"),
  validate(IdParamSchema, "params"),
  validate(UpdateRawMaterialSchema, "body"),
  asyncHandler(RawMaterialController.update)
);

router.delete(
  "/:id",
  requirePermission("raw_materials", "delete"),
  validate(IdParamSchema, "params"),
  asyncHandler(RawMaterialController.remove)
);

router.get(
  "/:id/movements",
  requirePermission("raw_materials", "read"),
  validate(IdParamSchema, "params"),
  validate(MovementQuerySchema, "query"),
  asyncHandler(RawMaterialController.getMovements)
);

router.post(
  "/:id/suppliers",
  requirePermission("raw_materials", "update"),
  validate(IdParamSchema, "params"),
  validate(LinkSupplierSchema, "body"),
  asyncHandler(RawMaterialController.linkSupplier)
);

router.delete(
  "/:id/suppliers/:supplierId",
  requirePermission("raw_materials", "update"),
  validate(SupplierUnlinkParamSchema, "params"),
  asyncHandler(RawMaterialController.unlinkSupplier)
);

export default router;
