import { Router } from "express";
import { validate } from "../../middleware/validate";
import { authenticateStorefront, authenticateAdmin, authenticatePOS } from "../../middleware/authenticate";
import { authRateLimit, posRateLimit, apiRateLimit } from "../../middleware/rateLimiter";
import {
  StorefrontRegisterSchema,
  StorefrontLoginSchema,
  StorefrontVerifyEmailSchema,
  StorefrontForgotPasswordSchema,
  StorefrontResetPasswordSchema,
  StorefrontChangePasswordSchema,
  StorefrontGoogleSchema,
  AdminLoginSchema,
  AdminForgotPasswordSchema,
  AdminResetPasswordSchema,
  AdminChangePasswordSchema,
  POSLoginSchema,
  RefreshSchema,
} from "./auth.schema";
import * as ctrl from "./auth.controller";

export const storefrontAuthRouter = Router();
storefrontAuthRouter.post("/signup", authRateLimit, validate({ body: StorefrontRegisterSchema }), ctrl.storefrontRegister);
storefrontAuthRouter.post("/login", authRateLimit, validate({ body: StorefrontLoginSchema }), ctrl.storefrontLogin);
storefrontAuthRouter.post("/logout", authenticateStorefront, ctrl.storefrontLogout);
storefrontAuthRouter.post("/verify-email", authRateLimit, validate({ body: StorefrontVerifyEmailSchema }), ctrl.storefrontVerifyEmail);
storefrontAuthRouter.post("/resend-verification", authenticateStorefront, authRateLimit, ctrl.storefrontResendVerification);
storefrontAuthRouter.post("/forgot-password", authRateLimit, validate({ body: StorefrontForgotPasswordSchema }), ctrl.storefrontForgotPassword);
storefrontAuthRouter.post("/reset-password", authRateLimit, validate({ body: StorefrontResetPasswordSchema }), ctrl.storefrontResetPassword);
storefrontAuthRouter.post("/change-password", authenticateStorefront, validate({ body: StorefrontChangePasswordSchema }), ctrl.storefrontChangePassword);
storefrontAuthRouter.post("/google", authRateLimit, validate({ body: StorefrontGoogleSchema }), ctrl.storefrontGoogle);

export const adminAuthRouter = Router();
adminAuthRouter.post("/login", authRateLimit, validate({ body: AdminLoginSchema }), ctrl.adminLogin);
adminAuthRouter.post("/logout", authenticateAdmin, ctrl.adminLogout);
adminAuthRouter.post("/forgot-password", authRateLimit, validate({ body: AdminForgotPasswordSchema }), ctrl.adminForgotPassword);
adminAuthRouter.post("/reset-password", authRateLimit, validate({ body: AdminResetPasswordSchema }), ctrl.adminResetPassword);
adminAuthRouter.post("/change-password", authenticateAdmin, validate({ body: AdminChangePasswordSchema }), ctrl.adminChangePassword);
adminAuthRouter.get("/me", authenticateAdmin, ctrl.adminMe);

export const posAuthRouter = Router();
posAuthRouter.get("/staff", apiRateLimit, ctrl.posGetStaff);
posAuthRouter.post("/login", posRateLimit, validate({ body: POSLoginSchema }), ctrl.posLogin);
posAuthRouter.post("/logout", authenticatePOS, ctrl.posLogout);
posAuthRouter.get("/me", authenticatePOS, ctrl.posMe);

export const refreshRouter = Router();
refreshRouter.post("/", authRateLimit, validate({ body: RefreshSchema }), ctrl.refreshToken);
