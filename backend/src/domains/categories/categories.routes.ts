import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticateStaffResource } from "../../middleware/authenticate";
import { requirePermission } from "../../middleware/permission";
import { CategoryController } from "./categories.controller";
import {
  CategoryFlatQuerySchema,
  CreateCategorySchema,
  UpdateCategorySchema,
  IdParamSchema,
  ReorderSchema,
} from "./categories.schema";

const router = Router();

router.use(authenticateStaffResource);

router.get(
  "/",
  requirePermission("categories", "read"),
  asyncHandler(CategoryController.tree)
);

router.get(
  "/flat",
  requirePermission("categories", "read"),
  validate(CategoryFlatQuerySchema, "query"),
  asyncHandler(CategoryController.flat)
);

router.post(
  "/",
  requirePermission("categories", "create"),
  validate(CreateCategorySchema, "body"),
  asyncHandler(CategoryController.create)
);

router.put(
  "/:id",
  requirePermission("categories", "update"),
  validate(IdParamSchema, "params"),
  validate(UpdateCategorySchema, "body"),
  asyncHandler(CategoryController.update)
);

router.delete(
  "/:id",
  requirePermission("categories", "delete"),
  validate(IdParamSchema, "params"),
  asyncHandler(CategoryController.remove)
);

router.put(
  "/reorder",
  requirePermission("categories", "update"),
  validate(ReorderSchema, "body"),
  asyncHandler(CategoryController.reorder)
);

export default router;
