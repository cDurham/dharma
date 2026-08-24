import { Command } from "commander";
import {
  printError,
  printInfo,
  runCommandAsync,
  withSpinner,
} from "../utils/docker.js";

// Valid project names that have lint targets
const LINTABLE_PROJECTS = ["api", "web", "cli"];

export const lintCommand = new Command("lint").description(
  "Lint code using Biome",
);

lintCommand
  .argument(
    "[project]",
    "Project to lint (api, web, cli, or omit for all)",
    "all",
  )
  .action(async (project) => {
    const normalizedProject = project.toLowerCase();

    if (normalizedProject === "all") {
      printInfo("Linting all projects...");

      await withSpinner(
        "Running linter...",
        () => runCommandAsync("npx nx run-many --target=lint"),
        {
          successMessage: "All projects linted",
          failMessage: "Linting failed for one or more projects",
        },
      );
    } else if (LINTABLE_PROJECTS.includes(normalizedProject)) {
      printInfo(`Linting ${normalizedProject}...`);

      await withSpinner(
        `Linting ${normalizedProject}...`,
        () => runCommandAsync(`npx nx run ${normalizedProject}:lint`),
        {
          successMessage: `${normalizedProject} linted successfully`,
          failMessage: `Linting failed for ${normalizedProject}`,
        },
      );
    } else {
      printError(`Invalid project: ${project}`);
      printInfo(
        `Valid projects: ${LINTABLE_PROJECTS.join(", ")}, or omit for all`,
      );
      process.exit(1);
    }
  });
