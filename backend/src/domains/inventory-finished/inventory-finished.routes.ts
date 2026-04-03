import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticateStaffResource } from "../../middleware/authenticate";
import { requirePermission } from "../../middleware/permission";
import { InventoryFinishedController } from "./inventory-finished.controller";
import {
  FinishedListQuerySchema,
  VariantIdParamSchema,
  FinishedAdjustSchema,
  VariantMovementsQuerySchema,
} from "./inventory-finished.schema";

const router = Router();

router.use(authenticateStaffResource);

router.get(
  "/finished-goods",
  requirePermission("inventory_finished", "read"),
  validate(FinishedListQuerySchema, "query"),
  asyncHandler(InventoryFinishedController.list)
);

router.get(
  "/finished-goods/stats",
  requirePermission("inventory_finished", "read"),
  asyncHandler(InventoryFinishedController.stats)
);

router.post(
  "/finished-goods/:variantId/adjust",
  requirePermission("inventory_finished", "update"),
  validate(VariantIdParamSchema, "params"),
  validate(FinishedAdjustSchema, "body"),
  asyncHandler(InventoryFinishedController.adjust)
);

router.get(
  "/finished-goods/:variantId/movements",
  requirePermission("inventory_finished", "read"),
  validate(VariantIdParamSchema, "params"),
  validate(VariantMovementsQuerySchema, "query"),
  asyncHandler(InventoryFinishedController.movements)
);

export default router;
