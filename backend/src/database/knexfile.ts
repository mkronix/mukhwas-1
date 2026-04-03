import type { Knex } from "knex";
import path from "path";
import { config } from "../config/env";

const baseConnection = {
  host: config.database.host,
  port: config.database.port,
  user: config.database.username,
  password: config.database.password,
  database: config.database.database,
};

const commonConfig: Partial<Knex.Config> = {
  client: "pg",
  migrations: {
    tableName: "knex_migrations",
    directory: path.resolve(__dirname, "migrations"),
    extension: "ts",
    loadExtensions: [".ts"],
  },
  seeds: {
    directory: path.resolve(__dirname, "seeds"),
    extension: "ts",
    loadExtensions: [".ts"],
  },
};

const knexConfig: Record<string, Knex.Config> = {
  development: {
    ...commonConfig,
    connection: baseConnection,
    pool: {
      min: config.database.poolMin,
      max: config.database.poolMax,
    },
  },
  production: {
    ...commonConfig,
    connection: {
      ...baseConnection,
      ssl: { rejectUnauthorized: false },
    },
    pool: {
      min: config.database.poolMin,
      max: config.database.poolMax,
    },
  },
  test: {
    ...commonConfig,
    connection: baseConnection,
    pool: {
      min: 1,
      max: 5,
    },
  },
};

export default knexConfig;
module.exports = knexConfig;
