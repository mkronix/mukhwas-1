import dotenv from "dotenv";
import path from "path";
import { z } from "zod";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  /** Interface to bind (0.0.0.0 for all interfaces in production). */
  HOST: z.string().min(1).default("0.0.0.0"),
  PORT: z.coerce.number().int().default(5000),
  /** Optional public URL for logs and clients (e.g. https://api.example.com). If empty, derived for local display only. */
  PUBLIC_BASE_URL: z.string().optional().default(""),
  API_PREFIX: z.string().default("/api/v1"),

  /**
   * Enable Swagger UI at /api-docs. If unset: on in development/test, off in production.
   * Set to true/1/yes/on to force on; false/0/no/off to force off.
   */
  ENABLE_SWAGGER: z.string().optional().default(""),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().default(5432),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default("15m"),
  JWT_REFRESH_EXPIRY: z.string().default("30d"),

  BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(20).default(12),

  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
  CLOUDINARY_UPLOAD_PRESET: z.string().default("mukhwas_uploads"),

  RESEND_API_KEY: z.string().default(""),
  RESEND_FROM_EMAIL: z.string().default("noreply@mukhwas.com"),

  GOOGLE_CLIENT_ID: z.string().default(""),

  ALLOWED_ORIGINS: z
    .string()
    .default("http://localhost:3000,http://localhost:5173")
    .transform((val) =>
      val.split(",").map((o) => o.trim()).filter(Boolean)
    ),

  MAX_FILE_SIZE_MB: z.coerce.number().default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  for (const issue of parsed.error.issues) {
    const key = issue.path.length ? issue.path.join(".") : "root";
    process.stderr.write(`ENV ERROR - ${key}: ${issue.message}\n`);
  }
  process.exit(1);
}

export const config = {
  ...parsed.data,
  /** Resolved base URL for startup logs (no trailing slash). */
  get resolvedPublicBaseUrl(): string {
    const trimmed = parsed.data.PUBLIC_BASE_URL?.replace(/\/$/, "") ?? "";
    if (trimmed) return trimmed;
    const host = parsed.data.HOST === "0.0.0.0" ? "localhost" : parsed.data.HOST;
    return `http://${host}:${parsed.data.PORT}`;
  },
  get enableSwagger(): boolean {
    const raw = parsed.data.ENABLE_SWAGGER?.trim() ?? "";
    if (raw !== "") {
      return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
    }
    return parsed.data.NODE_ENV !== "production";
  },
  database: {
    host: parsed.data.DB_HOST,
    port: parsed.data.DB_PORT,
    username: parsed.data.DB_USER,
    password: parsed.data.DB_PASSWORD,
    database: parsed.data.DB_NAME,
    poolMin: 2,
    poolMax: parsed.data.NODE_ENV === "production" ? 20 : 10,
  },
};
