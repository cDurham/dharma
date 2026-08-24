import { Command } from "commander";
import {
  execInContainer,
  printError,
  printSuccess,
  runCommand,
  runCommandAsync,
} from "../utils/docker.js";

export const dbCommand = new Command("db").description(
  "Database management commands",
);

dbCommand
  .command("push")
  .description("Push database schema")
  .action(() => {
    printSuccess("Pushing database schema...");
    const result = execInContainer("api-dev", "npm run db:push");
    if (!result.success) {
      printError("Failed to push schema");
      process.exit(1);
    }
  });

dbCommand
  .command("seed")
  .description("Seed database with test data")
  .action(() => {
    printSuccess("Seeding database...");
    const result = execInContainer("api-dev", "npm run db:seed");
    if (!result.success) {
      printError("Failed to seed database");
      process.exit(1);
    }
  });

dbCommand
  .command("reset")
  .description("Reset database (drop, push, seed)")
  .action(() => {
    printSuccess("Resetting database...");
    const result = execInContainer("api-dev", "npm run db:reset");
    if (!result.success) {
      printError("Failed to reset database");
      process.exit(1);
    }
  });

dbCommand
  .command("studio")
  .description("Open Drizzle Studio")
  .action(() => {
    printSuccess("Opening Drizzle Studio...");
    const result = execInContainer("api-dev", "npm run db:studio");
    if (!result.success) {
      printError("Failed to open Drizzle Studio");
      process.exit(1);
    }
  });

dbCommand
  .command("shell")
  .alias("sh")
  .description("Open PostgreSQL shell")
  .action(async () => {
    await runCommandAsync(
      "docker exec -it dharma-db-1 psql -U postgres -d dharma_db",
    );
  });

dbCommand
  .command("generate")
  .description("Generate migration from schema changes")
  .action(() => {
    printSuccess("Generating migration...");
    const result = execInContainer("api-dev", "npm run db:generate");
    if (!result.success) {
      printError("Failed to generate migration");
      process.exit(1);
    }
  });

dbCommand
  .command("migrate")
  .description("Run pending migrations")
  .action(() => {
    printSuccess("Running migrations...");
    const result = execInContainer("api-dev", "npm run db:migrate");
    if (!result.success) {
      printError("Failed to run migrations");
      process.exit(1);
    }
  });
