import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { StatusCodes } from "http-status-codes";
import multer from "multer";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { config } from "../config/env";
import { logger } from "../utils/logger";

const isProd = config.NODE_ENV === "production";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const correlationId = req.correlationId;

  if (err instanceof ZodError) {
    const details: Record<string, string> = {};
    for (const issue of err.issues) {
      const key = issue.path.length ? issue.path.join(".") : "root";
      details[key] = issue.message;
    }
    logger.warn("Validation failed", {
      correlationId,
      method: req.method,
      pathUrl: req.originalUrl,
      issueCount: err.issues.length,
    });
    ApiResponse.error(res, StatusCodes.BAD_REQUEST, "VALIDATION_ERROR", "Validation failed", details);
    return;
  }

  if (err instanceof ApiError) {
    logger.error(err.message, {
      correlationId,
      method: req.method,
      pathUrl: req.originalUrl,
      statusCode: err.statusCode,
      code: err.code,
      stack: err.stack,
    });
    ApiResponse.error(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  if (err instanceof multer.MulterError) {
    handleMulterError(err, res);
    return;
  }

  if (isPostgresError(err)) {
    handlePgError(err, res);
    return;
  }

  const message = err instanceof Error ? err.message : "An unexpected error occurred";
  logger.error(message, {
    correlationId,
    method: req.method,
    pathUrl: req.originalUrl,
    statusCode: 500,
    code: "INTERNAL_ERROR",
    stack: err instanceof Error ? err.stack : undefined,
  });

  ApiResponse.error(
    res,
    StatusCodes.INTERNAL_SERVER_ERROR,
    "INTERNAL_ERROR",
    isProd ? "Internal server error" : message
  );
}

function handleMulterError(err: multer.MulterError, res: Response): void {
  switch (err.code) {
    case "LIMIT_FILE_SIZE":
      ApiResponse.error(res, StatusCodes.REQUEST_TOO_LONG, "FILE_TOO_LARGE", `File too large. Max size: ${config.MAX_FILE_SIZE_MB}MB`);
      return;
    case "LIMIT_FILE_COUNT":
      ApiResponse.error(res, StatusCodes.BAD_REQUEST, "TOO_MANY_FILES", "Too many files uploaded");
      return;
    case "LIMIT_UNEXPECTED_FILE":
      ApiResponse.error(res, StatusCodes.BAD_REQUEST, "UNEXPECTED_FIELD", `Unexpected field: ${err.field}`);
      return;
    default:
      ApiResponse.error(res, StatusCodes.BAD_REQUEST, "UPLOAD_ERROR", err.message);
      return;
  }
}

interface PgError {
  code: string;
  detail?: string;
  column?: string;
  constraint?: string;
}

function isPostgresError(err: unknown): err is PgError {
  if (!err || typeof err !== "object") return false;
  const e = err as Record<string, unknown>;
  return typeof e.code === "string" && /^\d{5}$/.test(e.code as string);
}

function handlePgError(err: PgError, res: Response): void {
  switch (err.code) {
    case "23505":
      ApiResponse.error(res, StatusCodes.CONFLICT, "DUPLICATE_ENTRY", extractConstraintMessage(err));
      return;
    case "23503":
      ApiResponse.error(res, StatusCodes.CONFLICT, "FOREIGN_KEY_VIOLATION", "Related resource constraint violated");
      return;
    case "23502":
      ApiResponse.error(res, StatusCodes.BAD_REQUEST, "MISSING_REQUIRED_FIELD", `Missing required field: ${err.column ?? "unknown"}`);
      return;
  }
}

function extractConstraintMessage(err: PgError): string {
  if (err.detail) return err.detail;
  if (err.constraint) return `Duplicate value violates constraint: ${err.constraint}`;
  return "A record with this value already exists";
}
