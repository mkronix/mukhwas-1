import http from "http";
import app from "./app";
import { config } from "./config/env";
import { SWAGGER_UI_PATH } from "./config/swagger";
import { checkDatabaseConnection } from "./database/knex";
import { logger } from "./utils/logger";

function logStartupBanner(listenUrl: string): void {
  const { NODE_ENV, HOST, PORT, API_PREFIX, resolvedPublicBaseUrl, database } = config;
  const apiBase = `${resolvedPublicBaseUrl}${API_PREFIX}`;
  const healthUrl = `${resolvedPublicBaseUrl}/health`;
  const swaggerUrl = `${resolvedPublicBaseUrl}${SWAGGER_UI_PATH}`;
  const lines = [
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `  Mukhwas API  |  ${NODE_ENV}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `  API base      ${apiBase}`,
    `  Health        ${healthUrl}  (ready: ${healthUrl}/ready)`,
    ...(config.enableSwagger
      ? [`  OpenAPI UI   ${swaggerUrl}  (legacy redirect: /api/docs)`]
      : [`  OpenAPI UI   disabled  (set ENABLE_SWAGGER=true to enable)`]),
    `  Process       pid ${process.pid}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
  ];
  for (const line of lines) {
    logger.info(line);
  }
}

function registerProcessHandlers(server: http.Server): void {
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}, closing server…`);
    server.close((closeErr) => {
      if (closeErr) {
        logger.error("Error while closing HTTP server", { error: closeErr });
        process.exit(1);
      }
      logger.info("HTTP server closed");
      process.exit(0);
    });
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("unhandledRejection", (reason: unknown) => {
    logger.error("Unhandled promise rejection", {
      error: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
  });

  process.on("uncaughtException", (err: Error) => {
    logger.error("Uncaught exception", { error: err.message, stack: err.stack });
    process.exit(1);
  });
}

async function bootstrap(): Promise<void> {
  try {
    await checkDatabaseConnection();
    logger.info("Database connection OK");
  } catch (err) {
    logger.error("Database connection failed — exiting", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    process.exit(1);
  }

  const server = http.createServer(app);

  registerProcessHandlers(server);

  server.listen(config.PORT, config.HOST, () => {
    const addr = server.address();
    const listenUrl =
      typeof addr === "object" && addr
        ? `http://${addr.address === "::" ? "[::]" : addr.address}:${addr.port}`
        : `${config.HOST}:${config.PORT}`;
    logStartupBanner(listenUrl);
  });

  server.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "EADDRINUSE") {
      logger.error(`Port ${config.PORT} is already in use on ${config.HOST}`);
    } else {
      logger.error("HTTP server error", { error: err.message, code: err.code });
    }
    process.exit(1);
  });
}

bootstrap().catch((err: unknown) => {
  logger.error("Bootstrap failed", {
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });
  process.exit(1);
});
