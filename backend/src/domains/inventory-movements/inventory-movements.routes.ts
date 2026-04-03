import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticateStaffResource } from "../../middleware/authenticate";
import { InventoryMovementsController } from "./inventory-movements.controller";
import { MovementsLogQuerySchema } from "./inventory-movements.schema";
import { requireInventoryLogExport, requireInventoryLogRead } from "./inventory-movements.middleware";

const router = Router();

router.use(authenticateStaffResource);

router.get(
  "/movements/export",
  requireInventoryLogExport,
  validate(MovementsLogQuerySchema, "query"),
  asyncHandler(InventoryMovementsController.exportCsv)
);

router.get(
  "/movements",
  requireInventoryLogRead,
  validate(MovementsLogQuerySchema, "query"),
  asyncHandler(InventoryMovementsController.list)
);

export default router;
