import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticateStaffResource } from "../../middleware/authenticate";
import { requirePermission } from "../../middleware/permission";
import { UnitController } from "./units.controller";
import {
  UnitListQuerySchema,
  CreateUnitSchema,
  UpdateUnitSchema,
  IdParamSchema,
  ConversionListQuerySchema,
  CreateConversionSchema,
  UpdateConversionSchema,
} from "./units.schema";

const router = Router();

router.use(authenticateStaffResource);

router.get(
  "/",
  requirePermission("units", "read"),
  validate(UnitListQuerySchema, "query"),
  asyncHandler(UnitController.list)
);

router.post(
  "/",
  requirePermission("units", "create"),
  validate(CreateUnitSchema, "body"),
  asyncHandler(UnitController.create)
);

router.put(
  "/:id",
  requirePermission("units", "update"),
  validate(IdParamSchema, "params"),
  validate(UpdateUnitSchema, "body"),
  asyncHandler(UnitController.update)
);

router.delete(
  "/:id",
  requirePermission("units", "delete"),
  validate(IdParamSchema, "params"),
  asyncHandler(UnitController.remove)
);

router.get(
  "/conversions",
  requirePermission("units", "read"),
  validate(ConversionListQuerySchema, "query"),
  asyncHandler(UnitController.listConversions)
);

router.post(
  "/conversions",
  requirePermission("units", "create"),
  validate(CreateConversionSchema, "body"),
  asyncHandler(UnitController.createConversion)
);

router.put(
  "/conversions/:id",
  requirePermission("units", "update"),
  validate(IdParamSchema, "params"),
  validate(UpdateConversionSchema, "body"),
  asyncHandler(UnitController.updateConversion)
);

router.delete(
  "/conversions/:id",
  requirePermission("units", "delete"),
  validate(IdParamSchema, "params"),
  asyncHandler(UnitController.removeConversion)
);

export default router;
