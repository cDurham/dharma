import { Command } from "commander";
import prompts from "prompts";
import { serviceRegistry } from "../config/services.js";
import { printError, runCommandAsync } from "../utils/docker.js";

export const logsCommand = new Command("logs")
  .description("View container logs")
  .argument("[services...]", 'Services to view logs for (or "all")')
  .option("-n, --tail <lines>", "Number of lines to show", "50")
  .option("--no-follow", "Don't follow logs")
  .action(async (services: string[], options) => {
    let selectedServices =
      services?.length > 0 ? serviceRegistry.resolveServiceNames(services) : [];
    const allServices = serviceRegistry.getAllServices();
    const devServices = serviceRegistry.getServicesByProfile("dev");

    // If no services specified, prompt user
    if (!selectedServices || selectedServices.length === 0) {
      const choices = allServices.map((service) => ({
        title: `${service.description} (${service.name})`,
        value: service.name,
        // Pre-select dev services (api, web) but not infrastructure
        selected: devServices.includes(service) && service.capabilities.canExec,
      }));

      const response = await prompts({
        type: "multiselect",
        name: "services",
        message: "Select services to view logs:",
        choices,
        hint: "- Space to select. Return to submit",
      });

      if (!response.services || response.services.length === 0) {
        printError("No services selected");
        process.exit(0);
      }

      selectedServices = response.services;
    }

    // Handle "all" shortcut
    if (selectedServices.includes("all")) {
      selectedServices = allServices.map((s) => s.name);
    }

    // Validate services
    const invalidServices = selectedServices.filter(
      (s) => !serviceRegistry.hasService(s),
    );
    if (invalidServices.length > 0) {
      printError(`Invalid service(s): ${invalidServices.join(", ")}`);
      printError(
        `Valid services: ${serviceRegistry.getServiceNames().join(", ")}, all`,
      );
      process.exit(1);
    }

    // Build docker logs command
    const containerNames = selectedServices
      .map((s) => serviceRegistry.getContainerName(s))
      .filter((name): name is string => name !== undefined);

    if (containerNames.length === 0) {
      printError("No valid containers found for selected services");
      process.exit(1);
    }

    // Default to following logs unless --no-follow is explicitly set
    const shouldFollow = options.follow !== false;
    const followFlag = shouldFollow ? "-f" : "";
    const tailFlag = `--tail ${options.tail}`;

    // Use docker compose logs for multiple services (supports multiple service names)
    // For single service, we can use either approach
    if (containerNames.length === 1) {
      // Single container - use docker logs directly
      const flags = [followFlag, tailFlag].filter((f) => f).join(" ");
      const cmd = `docker logs ${flags} ${containerNames[0]} 2>&1 | cat`;
      await runCommandAsync(cmd);
    } else {
      // Multiple containers - use docker compose logs which supports multiple services
      // docker compose logs uses service names from docker-compose.yml, not container names
      const serviceNames = selectedServices;
      // Flags must come before service names in docker compose logs
      const flags = [followFlag, tailFlag].filter((f) => f).join(" ");
      const cmd = `docker compose logs ${flags} ${serviceNames.join(" ")} 2>&1 | cat`;
      await runCommandAsync(cmd);
    }
  });
