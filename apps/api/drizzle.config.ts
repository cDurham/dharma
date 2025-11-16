import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

const __dirname = dirname(fileURLToPath(import.meta.url));

config();

// Validate required environment variables
const requiredEnvVars = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `❌ Missing required environment variables for Drizzle:\n  - ${missingVars.join("\n  - ")}\n\nPlease check your .env file.`,
  );
}

export default defineConfig({
  schema: join(__dirname, "src/db/schema/index.ts"),
  out: join(__dirname, "src/db/migrations"),
  dialect: "postgresql",
  dbCredentials: {
    host: requiredEnvVars.DB_HOST!,
    port: Number.parseInt(requiredEnvVars.DB_PORT!, 10),
    user: requiredEnvVars.DB_USER!,
    password: requiredEnvVars.DB_PASSWORD!,
    database: requiredEnvVars.DB_DATABASE!,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
