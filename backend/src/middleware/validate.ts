import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ApiError } from "../utils/ApiError";

interface ValidationSchema {
  body?: z.ZodTypeAny;
  query?: z.ZodTypeAny;
  params?: z.ZodTypeAny;
}

export function validate(schema: ValidationSchema | z.ZodTypeAny, target?: "body" | "query" | "params") {
  if (schema instanceof z.ZodType) {
    const t = target ?? "body";
    return (req: Request, _res: Response, next: NextFunction): void => {
      const result = schema.safeParse(req[t]);
      if (!result.success) {
        return next(result.error);
      }
      (req as unknown as Record<string, unknown>)[t] = result.data;
      next();
    };
  }

  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: z.ZodIssue[] = [];

    if (schema.body) {
      const result = schema.body.safeParse(req.body);
      if (!result.success) {
        errors.push(...result.error.issues.map((i) => ({ ...i, path: ["body", ...i.path] })));
      } else {
        req.body = result.data;
      }
    }

    if (schema.query) {
      const result = schema.query.safeParse(req.query);
      if (!result.success) {
        errors.push(...result.error.issues.map((i) => ({ ...i, path: ["query", ...i.path] })));
      } else {
        (req as unknown as Record<string, unknown>).query = result.data;
      }
    }

    if (schema.params) {
      const result = schema.params.safeParse(req.params);
      if (!result.success) {
        errors.push(...result.error.issues.map((i) => ({ ...i, path: ["params", ...i.path] })));
      } else {
        (req as unknown as Record<string, unknown>).params = result.data;
      }
    }

    if (errors.length > 0) {
      const details: Record<string, string> = {};
      for (const issue of errors) {
        const key = issue.path.join(".");
        details[key] = issue.message;
      }
      return next(ApiError.unprocessable("Validation failed", details));
    }

    next();
  };
}
