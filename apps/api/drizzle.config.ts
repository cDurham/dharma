import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_DATABASE: process.env.DB_DATABASE,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  throw new Error(
    `❌ Missing required environment variables for Drizzle:\n  - ${missingVars.join("\n  - ")}\n\nPlease check your .env file.`
  );
}

export default defineConfig({
  schema: "./apps/api/src/db/schema/index.ts",
  out: "./apps/api/src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: requiredEnvVars.DB_HOST!,
    port: parseInt(requiredEnvVars.DB_PORT!, 10),
    user: requiredEnvVars.DB_USER!,
    password: requiredEnvVars.DB_PASSWORD!,
    database: requiredEnvVars.DB_DATABASE!,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
