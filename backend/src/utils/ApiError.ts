import { StatusCodes } from "http-status-codes";

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    code: string = "INTERNAL_ERROR",
    details?: unknown,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details?: unknown) {
    return new ApiError(message, StatusCodes.BAD_REQUEST, "BAD_REQUEST", details);
  }

  static unauthorized(message = "Unauthorized", code = "UNAUTHORIZED", details?: unknown) {
    return new ApiError(message, StatusCodes.UNAUTHORIZED, code, details);
  }

  static forbidden(message = "Forbidden", code = "FORBIDDEN") {
    return new ApiError(message, StatusCodes.FORBIDDEN, code);
  }

  static notFound(message = "Resource not found", code = "NOT_FOUND") {
    return new ApiError(message, StatusCodes.NOT_FOUND, code);
  }

  static conflict(message: string, code = "CONFLICT", details?: unknown) {
    return new ApiError(message, StatusCodes.CONFLICT, code, details);
  }

  static unprocessable(message: string, details?: unknown) {
    return new ApiError(message, StatusCodes.UNPROCESSABLE_ENTITY, "VALIDATION_ERROR", details);
  }

  static tooManyRequests(message = "Too many requests", code = "RATE_LIMIT_EXCEEDED", details?: unknown) {
    return new ApiError(message, StatusCodes.TOO_MANY_REQUESTS, code, details);
  }

  static internal(message = "Internal server error") {
    return new ApiError(message, StatusCodes.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", undefined, false);
  }
}
