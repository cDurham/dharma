import { Command } from "commander";
import {
  createSpinner,
  printError,
  printInfo,
  printSuccess,
  runCommandAsync,
  withSpinner,
} from "../utils/docker.js";

export const prodCommand = new Command("prod").description(
  "Production environment management (local testing)",
);

prodCommand
  .command("up")
  .description("Start production environment locally")
  .option("-b, --build", "Build images before starting")
  .action(async (options) => {
    const cmd = options.build
      ? "docker compose --profile prod up -d --build"
      : "docker compose --profile prod up -d";

    await withSpinner(
      "Starting production environment...",
      () => runCommandAsync(cmd),
      { successMessage: "Production environment started" },
    );

    printInfo('Run "dharma logs --prod" to view logs');
    printInfo('Check health with: docker ps (look for "healthy" status)');
  });

prodCommand
  .command("down")
  .description("Stop production environment")
  .option("-v, --volumes", "Remove volumes")
  .action(async (options) => {
    const cmd = options.volumes
      ? "docker compose --profile prod down -v"
      : "docker compose --profile prod down";

    await withSpinner(
      "Stopping production environment...",
      () => runCommandAsync(cmd),
      { successMessage: "Production environment stopped" },
    );
  });

prodCommand
  .command("restart")
  .description("Restart production environment")
  .action(async () => {
    printInfo("Restarting production environment...");

    let result = await runCommandAsync("docker compose --profile prod down");
    if (!result.success) {
      printError("Failed to stop containers");
      process.exit(1);
    }

    result = await runCommandAsync("docker compose --profile prod up -d");
    if (result.success) {
      printSuccess("Production environment restarted");
    } else {
      printError("Failed to restart production environment");
      process.exit(1);
    }
  });

prodCommand
  .command("rebuild")
  .description("Rebuild production environment")
  .argument("[service]", 'Service to rebuild (api, web, or "all")', "all")
  .action(async (service) => {
    const resolvedService = service === "all" ? "all" : service;

    if (resolvedService === "all") {
      printInfo("Rebuilding all production services...");

      await withSpinner(
        "Stopping containers...",
        () => runCommandAsync("docker compose --profile prod down"),
        { successMessage: "Containers stopped" },
      );

      await withSpinner(
        "Building images...",
        () => runCommandAsync("docker compose --profile prod build --no-cache"),
        { successMessage: "Images built" },
      );

      await withSpinner(
        "Starting containers...",
        () => runCommandAsync("docker compose --profile prod up -d"),
        { successMessage: "Production environment rebuilt" },
      );

      printInfo("Check health status with: docker ps");
    } else if (resolvedService === "api" || resolvedService === "web") {
      printInfo(`Rebuilding ${resolvedService}...`);

      await runCommandAsync(
        `docker compose --profile prod stop ${resolvedService}`,
      );
      await runCommandAsync(
        `docker compose --profile prod rm -f ${resolvedService}`,
      );

      const spinner = createSpinner(`Building ${resolvedService}...`).start();
      const buildResult = await runCommandAsync(
        `docker compose --profile prod build --no-cache ${resolvedService}`,
      );

      if (!buildResult.success) {
        spinner.fail("Build failed");
        process.exit(1);
      }

      spinner.text = `Starting ${resolvedService}...`;
      const upResult = await runCommandAsync(
        `docker compose --profile prod up -d ${resolvedService}`,
      );

      if (upResult.success) {
        spinner.succeed(`${resolvedService} rebuilt successfully`);
        printInfo("Check health status with: docker ps");
      } else {
        spinner.fail(`Failed to start ${resolvedService}`);
        process.exit(1);
      }
    } else {
      printError(`Invalid service: ${service}`);
      printError("Valid services: api, web, all");
      process.exit(1);
    }
  });

prodCommand
  .command("logs")
  .description("View production container logs")
  .argument("[services...]", "Services to show logs for (api, web)", [
    "api",
    "web",
  ])
  .option("-f, --follow", "Follow log output")
  .action(async (services, options) => {
    const serviceList = services.join(" ");
    const cmd = options.follow
      ? `docker compose --profile prod logs -f ${serviceList}`
      : `docker compose --profile prod logs ${serviceList}`;

    await runCommandAsync(cmd, { stdio: "inherit" });
  });

prodCommand
  .command("health")
  .description("Check health status of production services")
  .action(async () => {
    printInfo("Checking production service health...\n");

    // Check API health endpoint
    const apiHealthResult = await runCommandAsync(
      "curl -f http://localhost:3000/health",
    );
    if (apiHealthResult.success) {
      printSuccess("✓ API health endpoint: OK");
    } else {
      printError("✗ API health endpoint: FAILED");
    }

    // Check Docker health status
    printInfo("\nDocker health status:");
    await runCommandAsync(
      'docker ps --filter "name=dharma" --format "table {{.Names}}\t{{.Status}}"',
      { stdio: "inherit" },
    );
  });

prodCommand
  .command("nuke")
  .description("Complete teardown (stop, remove volumes)")
  .action(async () => {
    printInfo("💣 Removing production environment...");

    await withSpinner(
      "Stopping containers...",
      () => runCommandAsync("docker compose --profile prod down -v"),
      { successMessage: "Production environment removed" },
    );
  });
