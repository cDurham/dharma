const { join } = require("node:path");
const { defineConfig } = require("drizzle-kit");

// Note: dotenv is not needed here because:
// - In Docker: env vars are loaded via docker-compose.yml (env_file: .env)
// - Locally: env vars should be loaded by the shell or process manager
// If you need to load .env manually when running locally, do it before running drizzle-kit

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

module.exports = defineConfig({
  // Point at compiled output to avoid TypeScript resolution issues
  schema: join(__dirname, "../../dist/apps/api/src/db/schema/index.js"),
  out: join(__dirname, "src/db/migrations"),
  dialect: "postgresql",
  dbCredentials: {
    host: requiredEnvVars.DB_HOST,
    port: parseInt(requiredEnvVars.DB_PORT, 10),
    user: requiredEnvVars.DB_USER,
    password: requiredEnvVars.DB_PASSWORD,
    database: requiredEnvVars.DB_DATABASE,
    ssl: false,
  },
  verbose: true,
  strict: true,
});
