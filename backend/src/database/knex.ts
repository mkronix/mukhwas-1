import knex from "knex";
import { config } from "../config/env";

export const db = knex({
  client: "pg",
  connection: {
    host: config.database.host,
    port: config.database.port,
    user: config.database.username,
    password: config.database.password,
    database: config.database.database,
    ssl:
      config.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : undefined,
  },
  pool: {
    min: config.database.poolMin,
    max: config.database.poolMax,
    acquireTimeoutMillis: 30000,
  },
  asyncStackTraces: config.NODE_ENV !== "production",
  migrations: {
    tableName: "knex_migrations",
    directory: "./src/database/migrations",
    extension: "ts",
    loadExtensions: [".ts"],
  },
  seeds: {
    directory: "./src/database/seeds",
    extension: "ts",
    loadExtensions: [".ts"],
  },
});

export async function checkDatabaseConnection(): Promise<void> {
  try {
    await db.raw("SELECT 1");
  } catch (err) {
    throw new Error(
      `Database connection failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
