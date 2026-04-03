import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { ApiError } from "./ApiError";

export type Surface = "storefront" | "admin" | "pos";

export interface TokenPayload {
  sub: string;
  surface: Surface;
  [key: string]: unknown;
}

export interface DecodedToken extends TokenPayload {
  aud: string;
  iat: number;
  exp: number;
}

export function signAccessToken(payload: TokenPayload): string {
  const { surface, ...rest } = payload;
  return jwt.sign({ ...rest, surface }, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRY,
    audience: surface,
  } as jwt.SignOptions);
}

export function signRefreshToken(payload: TokenPayload): string {
  const { surface, ...rest } = payload;
  return jwt.sign({ ...rest, surface }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRY,
    audience: surface,
  } as jwt.SignOptions);
}

export function verifyToken(token: string, expectedAudience: Surface): DecodedToken {
  try {
    return jwt.verify(token, config.JWT_ACCESS_SECRET, {
      audience: expectedAudience,
    }) as DecodedToken;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw ApiError.unauthorized("Token expired", "TOKEN_EXPIRED");
    }
    throw ApiError.unauthorized("Invalid or expired token", "INVALID_TOKEN");
  }
}

export function verifyRefreshToken(token: string, expectedAudience: Surface): DecodedToken {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET, {
      audience: expectedAudience,
    }) as DecodedToken;
  } catch {
    throw ApiError.unauthorized("Invalid refresh token", "INVALID_TOKEN");
  }
}

export function decodeTokenUnsafe(token: string): DecodedToken | null {
  try {
    return jwt.decode(token) as DecodedToken | null;
  } catch {
    return null;
  }
}
