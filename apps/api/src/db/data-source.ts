import "reflect-metadata";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { appConfig } from "../config/app.config.js";
import * as schema from "./schema/index.js";

const poolConfig = {
  host: appConfig.db.host,
  port: appConfig.db.port,
  user: appConfig.db.user,
  password: appConfig.db.password,
  database: appConfig.db.database,
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // Production points at a managed Postgres (RDS) over the network; dev and
  // test point at a plaintext local container.
  ssl: appConfig.isProduction,
};

export const pool = new Pool(poolConfig);

export const db = drizzle(pool, { schema });

export const closeConnections = async () => {
  await pool.end();
};
