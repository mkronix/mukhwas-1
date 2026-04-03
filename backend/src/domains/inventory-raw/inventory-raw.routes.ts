import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticateStaffResource } from "../../middleware/authenticate";
import { requirePermission } from "../../middleware/permission";
import { InventoryRawController } from "./inventory-raw.controller";
import {
  RawInventoryListQuerySchema,
  MaterialIdParamSchema,
  RawAdjustSchema,
} from "./inventory-raw.schema";

const router = Router();

router.use(authenticateStaffResource);

router.get(
  "/raw-materials",
  requirePermission("inventory_raw", "read"),
  validate(RawInventoryListQuerySchema, "query"),
  asyncHandler(InventoryRawController.list)
);

router.get(
  "/raw-materials/stats",
  requirePermission("inventory_raw", "read"),
  asyncHandler(InventoryRawController.stats)
);

router.post(
  "/raw-materials/:materialId/adjust",
  requirePermission("inventory_raw", "update"),
  validate(MaterialIdParamSchema, "params"),
  validate(RawAdjustSchema, "body"),
  asyncHandler(InventoryRawController.adjust)
);

export default router;
