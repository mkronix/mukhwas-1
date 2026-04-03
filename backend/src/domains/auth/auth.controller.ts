import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import * as authService from "./auth.service";
import type {
  StorefrontRegisterDto,
  StorefrontLoginDto,
  StorefrontVerifyEmailDto,
  StorefrontForgotPasswordDto,
  StorefrontResetPasswordDto,
  StorefrontChangePasswordDto,
  StorefrontGoogleDto,
  AdminLoginDto,
  AdminForgotPasswordDto,
  AdminResetPasswordDto,
  AdminChangePasswordDto,
  POSLoginDto,
  RefreshDto,
} from "./auth.schema";

export const storefrontRegister = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.storefrontRegister(req.body as StorefrontRegisterDto, req.correlationId);
  ApiResponse.created(res, result);
});

export const storefrontLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.storefrontLogin(req.body as StorefrontLoginDto);
  ApiResponse.success(res, result);
});

export const storefrontLogout = asyncHandler(async (req: Request, res: Response) => {
  await authService.storefrontLogout(req.user!.sub);
  res.status(204).end();
});

export const storefrontVerifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.storefrontVerifyEmail(req.body as StorefrontVerifyEmailDto);
  ApiResponse.success(res, result);
});

export const storefrontResendVerification = asyncHandler(async (req: Request, res: Response) => {
  await authService.storefrontResendVerification(req.user!.sub, req.correlationId);
  ApiResponse.success(res, { message: "Verification email sent" });
});

export const storefrontForgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.storefrontForgotPassword(req.body as StorefrontForgotPasswordDto, req.correlationId);
  ApiResponse.success(res, { message: "If that email exists, a reset link has been sent" });
});

export const storefrontResetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.storefrontResetPassword(req.body as StorefrontResetPasswordDto);
  ApiResponse.success(res, { message: "Password reset successfully" });
});

export const storefrontChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.storefrontChangePassword(req.user!.sub, req.body as StorefrontChangePasswordDto);
  ApiResponse.success(res, result);
});

export const storefrontGoogle = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.storefrontGoogleLogin(req.body as StorefrontGoogleDto);
  ApiResponse.success(res, result);
});

export const adminLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.adminLogin(req.body as AdminLoginDto);
  ApiResponse.success(res, result);
});

export const adminLogout = asyncHandler(async (req: Request, res: Response) => {
  await authService.adminLogout(req.user!.sub);
  res.status(204).end();
});

export const adminForgotPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.adminForgotPassword(req.body as AdminForgotPasswordDto, req.correlationId);
  ApiResponse.success(res, { message: "If that email exists, a reset link has been sent" });
});

export const adminResetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.adminResetPassword(req.body as AdminResetPasswordDto);
  ApiResponse.success(res, { message: "Password reset successfully" });
});

export const adminChangePassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.adminChangePassword(req.user!.sub, req.body as AdminChangePasswordDto);
  ApiResponse.success(res, result);
});

export const adminMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.adminMe(req.user!.sub);
  ApiResponse.success(res, result);
});

export const posGetStaff = asyncHandler(async (_req: Request, res: Response) => {
  const result = await authService.posGetStaffList();
  ApiResponse.success(res, result);
});

export const posLogin = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.posLogin(req.body as POSLoginDto);
  ApiResponse.success(res, result);
});

export const posLogout = asyncHandler(async (req: Request, res: Response) => {
  await authService.posLogout(req.user!.sub);
  res.status(204).end();
});

export const posMe = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.posMe(req.user!.sub);
  ApiResponse.success(res, result);
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.refreshTokens(req.body as RefreshDto);
  ApiResponse.success(res, result);
});
