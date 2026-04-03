import type { Response } from "express";
import { StatusCodes } from "http-status-codes";

export class ApiResponse {
  static success<T, M = unknown>(
    res: Response,
    data: T,
    statusCode: number = StatusCodes.OK,
    meta?: M
  ) {
    const body: { success: true; data: T; meta?: M } = { success: true, data };
    if (meta !== undefined) body.meta = meta;
    return res.status(statusCode).json(body);
  }

  static created<T>(res: Response, data: T) {
    return ApiResponse.success(res, data, StatusCodes.CREATED);
  }

  static noContent(res: Response) {
    return res.status(StatusCodes.NO_CONTENT).send();
  }

  static error(
    res: Response,
    statusCode: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    const error: { code: string; message: string; details?: unknown } = { code, message };
    if (details !== undefined) error.details = details;
    return res.status(statusCode).json({ success: false, error });
  }
}
