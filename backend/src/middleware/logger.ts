import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { logger } from "../utils/logger";

const SENSITIVE_FIELDS = new Set(["password", "pin", "token", "secret", "pin_hash", "password_hash"]);

function sanitizeBody(body: unknown): unknown {
  if (!body || typeof body !== "object") return body;
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (SENSITIVE_FIELDS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const correlationId = crypto.randomUUID();
  req.correlationId = correlationId;

  const start = Date.now();

  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const meta = {
      correlationId,
      method: req.method,
      pathUrl: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
    };

    if (res.statusCode >= 500) {
      logger.error(req.originalUrl, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(req.originalUrl, meta);
    } else {
      logger.info(req.originalUrl, meta);
    }
  });

  next();
}
