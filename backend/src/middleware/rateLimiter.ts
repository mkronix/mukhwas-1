import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

interface RateLimitStore {
  [key: string]: { count: number; resetAt: number };
}

interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
}

function createRateLimiter(options: RateLimitOptions) {
  const store: RateLimitStore = {};
  const { windowMs, max } = options;
  const keyGen = options.keyGenerator ?? ((req: Request) => req.ip ?? "unknown");

  setInterval(() => {
    const now = Date.now();
    for (const key of Object.keys(store)) {
      if (store[key].resetAt <= now) delete store[key];
    }
  }, windowMs).unref();

  return (req: Request, _res: Response, next: NextFunction): void => {
    const key = keyGen(req);
    const now = Date.now();

    if (!store[key] || store[key].resetAt <= now) {
      store[key] = { count: 1, resetAt: now + windowMs };
      return next();
    }

    store[key].count += 1;

    if (store[key].count > max) {
      return next(ApiError.tooManyRequests("Too many requests. Please try again later."));
    }

    next();
  };
}

export const authRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
});

export const apiRateLimit = createRateLimiter({
  windowMs: 60 * 1000,
  max: 200,
});

export const posRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req: Request) => {
    const user = req.user as { sub?: string } | undefined;
    return user?.sub ?? req.ip ?? "unknown";
  },
});

export const globalRateLimiter = apiRateLimit;
export const authRateLimiter = authRateLimit;
