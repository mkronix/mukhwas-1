import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { validate } from "../../middleware/validate";
import { authenticateStaffResource, authenticateStorefront, authenticatePOS } from "../../middleware/authenticate";
import { requirePermission, requirePOSAccess } from "../../middleware/permission";
import { CustomerController } from "./customers.controller";
import {
  CustomerListQuerySchema,
  UpdateCustomerSchema,
  IdParamSchema,
  StatusToggleSchema,
  CustomerOrdersQuerySchema,
  StorefrontUpdateProfileSchema,
  CreateAddressSchema,
  UpdateAddressSchema,
  CreatePosCustomerSchema,
} from "./customers.schema";

export const adminCustomerRouter = Router();

adminCustomerRouter.use(authenticateStaffResource);

adminCustomerRouter.get(
  "/",
  requirePermission("customers", "read"),
  validate(CustomerListQuerySchema, "query"),
  asyncHandler(CustomerController.list)
);

adminCustomerRouter.get(
  "/:id",
  requirePermission("customers", "read"),
  validate(IdParamSchema, "params"),
  asyncHandler(CustomerController.getById)
);

adminCustomerRouter.put(
  "/:id",
  requirePermission("customers", "update"),
  validate(IdParamSchema, "params"),
  validate(UpdateCustomerSchema, "body"),
  asyncHandler(CustomerController.update)
);

adminCustomerRouter.patch(
  "/:id/status",
  requirePermission("customers", "update"),
  validate(IdParamSchema, "params"),
  validate(StatusToggleSchema, "body"),
  asyncHandler(CustomerController.toggleStatus)
);

adminCustomerRouter.get(
  "/:id/orders",
  requirePermission("customers", "read"),
  validate(IdParamSchema, "params"),
  validate(CustomerOrdersQuerySchema, "query"),
  asyncHandler(CustomerController.getOrders)
);

adminCustomerRouter.get(
  "/:id/addresses",
  requirePermission("customers", "read"),
  validate(IdParamSchema, "params"),
  asyncHandler(CustomerController.getAddresses)
);

export const storefrontCustomerRouter = Router();

storefrontCustomerRouter.use(authenticateStorefront);

storefrontCustomerRouter.get(
  "/me",
  asyncHandler(CustomerController.getProfile)
);

storefrontCustomerRouter.put(
  "/me",
  validate(StorefrontUpdateProfileSchema, "body"),
  asyncHandler(CustomerController.updateProfile)
);

storefrontCustomerRouter.get(
  "/me/addresses",
  asyncHandler(CustomerController.getMyAddresses)
);

storefrontCustomerRouter.post(
  "/me/addresses",
  validate(CreateAddressSchema, "body"),
  asyncHandler(CustomerController.createMyAddress)
);

storefrontCustomerRouter.put(
  "/me/addresses/:id",
  validate(IdParamSchema, "params"),
  validate(UpdateAddressSchema, "body"),
  asyncHandler(CustomerController.updateMyAddress)
);

storefrontCustomerRouter.delete(
  "/me/addresses/:id",
  validate(IdParamSchema, "params"),
  asyncHandler(CustomerController.deleteMyAddress)
);

storefrontCustomerRouter.patch(
  "/me/addresses/:id/default",
  validate(IdParamSchema, "params"),
  asyncHandler(CustomerController.setDefaultAddress)
);

export const posCustomerRouter = Router();

posCustomerRouter.use(authenticatePOS);
posCustomerRouter.use(requirePOSAccess);

posCustomerRouter.post(
  "/",
  validate({ body: CreatePosCustomerSchema }),
  asyncHandler(CustomerController.createFromPos)
);
