import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticateStaffResource, authenticatePOS } from "../../middleware/authenticate";
import { requirePermission, requirePOSAccess } from "../../middleware/permission";
import { singleImage } from "../upload/upload.middleware";
import { ProductController } from "./products.controller";
import {
  AdminProductListQuerySchema,
  CreateProductSchema,
  UpdateProductSchema,
  IdParamSchema,
  StorefrontProductListQuerySchema,
  DeleteProductImageSchema,
  SlugParamSchema,
} from "./products.schema";

export const adminProductRouter = Router();

adminProductRouter.use(authenticateStaffResource);

adminProductRouter.get(
  "/categories-with-counts",
  requirePermission("products", "read"),
  asyncHandler(ProductController.categoriesWithCounts)
);

adminProductRouter.get(
  "/",
  requirePermission("products", "read"),
  validate(AdminProductListQuerySchema, "query"),
  asyncHandler(ProductController.adminList)
);

adminProductRouter.post(
  "/",
  requirePermission("products", "create"),
  validate(CreateProductSchema, "body"),
  asyncHandler(ProductController.create)
);

adminProductRouter.post(
  "/:id/images",
  requirePermission("products", "update"),
  validate(IdParamSchema, "params"),
  singleImage("file"),
  asyncHandler(ProductController.addImage)
);

adminProductRouter.delete(
  "/:id/images",
  requirePermission("products", "update"),
  validate(IdParamSchema, "params"),
  validate(DeleteProductImageSchema, "body"),
  asyncHandler(ProductController.deleteImage)
);

adminProductRouter.patch(
  "/:id/archive",
  requirePermission("products", "update"),
  validate(IdParamSchema, "params"),
  asyncHandler(ProductController.archive)
);

adminProductRouter.get(
  "/:id",
  requirePermission("products", "read"),
  validate(IdParamSchema, "params"),
  asyncHandler(ProductController.adminGetById)
);

adminProductRouter.put(
  "/:id",
  requirePermission("products", "update"),
  validate(IdParamSchema, "params"),
  validate(UpdateProductSchema, "body"),
  asyncHandler(ProductController.update)
);

adminProductRouter.delete(
  "/:id",
  requirePermission("products", "delete"),
  validate(IdParamSchema, "params"),
  asyncHandler(ProductController.remove)
);

export const storefrontProductRouter = Router();

storefrontProductRouter.get(
  "/",
  validate(StorefrontProductListQuerySchema, "query"),
  asyncHandler(ProductController.storefrontList)
);

storefrontProductRouter.get(
  "/slug/:slug",
  validate(SlugParamSchema, "params"),
  asyncHandler(ProductController.storefrontBySlug)
);

storefrontProductRouter.get(
  "/:id",
  validate(IdParamSchema, "params"),
  asyncHandler(ProductController.storefrontById)
);

export const posProductRouter = Router();

posProductRouter.use(authenticatePOS);
posProductRouter.use(requirePOSAccess);

posProductRouter.get(
  "/",
  requirePermission("products", "read"),
  asyncHandler(ProductController.posCatalog)
);
