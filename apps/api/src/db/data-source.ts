import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Database connection configuration
 * Convert "db" hostname to "localhost" when running from host machine
 */
const dbHost = process.env.DB_HOST || process.env.DB_WRITE_HOST || "localhost";
const poolConfig = {
  host: dbHost === "db" ? "localhost" : dbHost,
  port: parseInt(
    process.env.DB_PORT || process.env.DB_WRITE_PORT || "5432",
    10
  ),
  user: process.env.DB_USER || process.env.DB_WRITE_USER || "postgres",
  password:
    process.env.DB_PASSWORD || process.env.DB_WRITE_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "dharma_db",
  max: 20, // Maximum pool size
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

/**
 * PostgreSQL connection pool
 */
export const pool = new Pool(poolConfig);

/**
 * Drizzle database instance with schema
 */
export const db = drizzle(pool, { schema });

/**
 * Read-only database connection pool (for read replicas if configured)
 */
const readDbHost = process.env.DB_READ_HOST || process.env.DB_HOST || "localhost";
const readPoolConfig = {
  host: readDbHost === "db" ? "localhost" : readDbHost,
  port: parseInt(
    process.env.DB_READ_PORT || process.env.DB_PORT || "5432",
    10
  ),
  user: process.env.DB_READ_USER || process.env.DB_USER || "postgres",
  password:
    process.env.DB_READ_PASSWORD || process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "dharma_db",
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

/**
 * Read-only pool (falls back to write pool if no read replica configured)
 */
export const readPool =
  process.env.DB_READ_HOST && process.env.DB_READ_HOST !== process.env.DB_HOST
    ? new Pool(readPoolConfig)
    : pool;

/**
 * Read-only Drizzle database instance
 */
export const readDb = drizzle(readPool, { schema });

/**
 * Graceful shutdown
 */
export const closeConnections = async () => {
  await pool.end();
  if (readPool !== pool) {
    await readPool.end();
  }
};
