import { execSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { applyTestEnv } from "./vitest.env.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

const RETRIES = 30;
const RETRY_DELAY_MS = 1000;

async function adminClient(): Promise<Client> {
  // "postgres" is the maintenance database; it exists on every server.
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number.parseInt(process.env.DB_PORT ?? "5432", 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: "postgres",
  });
  await client.connect();
  return client;
}

async function waitForPostgres(): Promise<Client> {
  let lastError: unknown;
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      return await adminClient();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
  throw new Error(
    `No postgres at ${process.env.DB_HOST}:${process.env.DB_PORT} after ${RETRIES}s. ` +
      "Start one with: podman run -d --name dharma-test-pg -p 5433:5432 " +
      "-e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=dharma_test docker.io/library/postgres:17",
    { cause: lastError },
  );
}

async function ensureDatabase(client: Client, name: string): Promise<void> {
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) {
    throw new Error(`Unsafe test database name: ${name}`);
  }
  const existing = await client.query(
    "SELECT 1 FROM pg_database WHERE datname = $1",
    [name],
  );
  if (existing.rowCount === 0) {
    await client.query(`CREATE DATABASE ${name}`);
  }
}

export default async function globalSetup(): Promise<void> {
  applyTestEnv();

  const client = await waitForPostgres();
  try {
    await ensureDatabase(client, process.env.DB_DATABASE as string);
  } finally {
    await client.end();
  }

  // The repo has no SQL migrations; `push` creates the schema.
  // drizzle.config.cjs reads the compiled schema from dist/, so build first
  // (drizzle-kit cannot load the .ts config in this ESM workspace).
  const root = join(__dirname, "../..");
  execSync("pnpm exec tsc -b apps/api/tsconfig.app.json", {
    stdio: "inherit",
    cwd: root,
    env: process.env,
  });
  execSync(
    "pnpm exec drizzle-kit push --force --config=apps/api/drizzle.config.cjs",
    { stdio: "inherit", cwd: root, env: process.env },
  );
}
