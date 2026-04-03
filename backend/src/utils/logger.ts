import winston from "winston";
import type { TransformableInfo } from "logform";
import path from "path";
import { config } from "../config/env";

type DevLogInfo = TransformableInfo & {
  correlationId?: string;
  method?: string;
  pathUrl?: string;
  statusCode?: number;
  durationMs?: number;
  code?: string;
  stack?: string;
};

const isProd = config.NODE_ENV === "production";

const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.printf((info: DevLogInfo) => {
    const { timestamp, level, message, correlationId, method, pathUrl, statusCode, durationMs, code, stack } = info;
    const parts = [
      `${level}:`,
      correlationId ? `[${correlationId}]` : "",
      method && pathUrl ? `${method} ${pathUrl}` : "",
      statusCode ? `${statusCode}` : "",
      durationMs !== undefined ? `${durationMs}ms` : "",
      message,
      code ? `code=${code}` : "",
    ].filter(Boolean);
    const line = parts.join(" ");
    return stack ? `${line}\n${stack}` : line;
  })
);

/** Plain, parse-friendly lines for production stdout (aggregators or journald). */
const prodConsoleFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss.SSS" }),
  winston.format.printf((info: DevLogInfo) => {
    const { timestamp, level, message, correlationId, method, pathUrl, statusCode, durationMs, code, stack } = info;
    const base = [
      timestamp,
      level.toUpperCase(),
      correlationId ? `cid=${correlationId}` : "",
      method && pathUrl ? `${method} ${pathUrl}` : "",
      statusCode != null ? `status=${statusCode}` : "",
      durationMs != null ? `${durationMs}ms` : "",
      message,
      code ? `code=${code}` : "",
    ]
      .filter(Boolean)
      .join(" | ");
    return stack ? `${base}\n${stack}` : base;
  })
);

const transports: winston.transport[] = [
  new winston.transports.File({
    filename: path.resolve(__dirname, "../../logs/error.log"),
    level: "error",
    format: isProd ? prodFormat : winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }),
  new winston.transports.File({
    filename: path.resolve(__dirname, "../../logs/combined.log"),
    level: "info",
    format: isProd ? prodFormat : winston.format.combine(winston.format.timestamp(), winston.format.json()),
  }),
];

transports.push(
  new winston.transports.Console({
    level: isProd ? "info" : "debug",
    format: isProd ? prodConsoleFormat : devFormat,
    stderrLevels: ["error"],
  })
);

export const logger = winston.createLogger({
  level: isProd ? "info" : "debug",
  transports,
});
