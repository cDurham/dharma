import { readFileSync } from "fs";
import { resolve } from "path";
import { parse } from "yaml";

export interface ServiceConfig {
  name: string;
  containerName: string;
  profile: "dev" | "prod" | "all";
  description: string;
  capabilities: {
    canExec: boolean;
    canRestart: boolean;
    canRebuild: boolean;
    hasLogs: boolean;
  };
  metadata: {
    ports?: number[];
    dependsOn?: string[];
    hasHealthCheck?: boolean;
    volumes?: string[];
    image?: string;
  };
}

interface DockerComposeService {
  profiles?: string[];
  image?: string;
  build?: any;
  ports?: string[];
  depends_on?: any;
  healthcheck?: any;
  volumes?: string[];
  environment?: any;
  env_file?: any;
}

interface DockerComposeFile {
  services?: Record<string, DockerComposeService>;
  [key: string]: any;
}

/**
 * Parse docker-compose.yml and extract service configurations
 */
export function parseDockerCompose(
  projectRoot: string = process.cwd(),
): Map<string, ServiceConfig> {
  const composePath = resolve(projectRoot, "docker-compose.yml");

  try {
    const composeContent = readFileSync(composePath, "utf-8");
    const compose: DockerComposeFile = parse(composeContent);

    if (!compose.services) {
      throw new Error("No services found in docker-compose.yml");
    }

    const services = new Map<string, ServiceConfig>();

    // Get project name from directory or default to 'dharma'
    const projectName = projectRoot.split("/").pop() || "dharma";

    for (const [serviceName, serviceConfig] of Object.entries(
      compose.services,
    )) {
      const profile = detectProfile(serviceConfig);
      const containerName = generateContainerName(
        projectName,
        serviceName,
        profile,
      );

      services.set(serviceName, {
        name: serviceName,
        containerName,
        profile,
        description: generateDescription(serviceName, serviceConfig),
        capabilities: {
          canExec: canExecuteShell(serviceName, serviceConfig),
          canRestart: true, // All containers can be restarted
          canRebuild: hasRebuildCapability(serviceConfig),
          hasLogs: true, // All containers have logs
        },
        metadata: {
          ports: extractPorts(serviceConfig),
          dependsOn: extractDependencies(serviceConfig),
          hasHealthCheck: !!serviceConfig.healthcheck,
          volumes: serviceConfig.volumes?.map((v) =>
            typeof v === "string" ? v : "",
          ),
          image: serviceConfig.image,
        },
      });
    }

    return services;
  } catch (error) {
    throw new Error(
      `Failed to parse docker-compose.yml: ${error instanceof Error ? error.message : error}`,
    );
  }
}

/**
 * Detect which profile a service belongs to
 */
function detectProfile(service: DockerComposeService): "dev" | "prod" | "all" {
  if (!service.profiles || service.profiles.length === 0) {
    return "all"; // Services without profiles run in all environments
  }

  if (service.profiles.includes("dev")) return "dev";
  if (service.profiles.includes("prod")) return "prod";

  return "all";
}

/**
 * Generate container name following Docker Compose naming convention
 * Format: {project}_{service}_{replica}
 * Or for newer compose: {project}-{service}-{replica}
 */
function generateContainerName(
  project: string,
  service: string,
  profile: "dev" | "prod" | "all",
): string {
  // Newer docker compose uses dashes
  // e.g., dharma-api-dev-1, dharma-db-1
  return `${project}-${service}-1`;
}

/**
 * Generate a human-readable description for the service
 */
function generateDescription(
  name: string,
  service: DockerComposeService,
): string {
  // Custom descriptions based on service name
  const descriptions: Record<string, string> = {
    api: "NestJS API Server",
    "api-dev": "NestJS API Server (Dev)",
    web: "React Frontend",
    "web-dev": "React Frontend (Dev)",
    db: "PostgreSQL Database",
    kafka: "Apache Kafka Message Broker",
    zookeeper: "Zookeeper (Kafka Coordination)",
  };

  if (descriptions[name]) {
    return descriptions[name];
  }

  // Fallback: use image name or build context
  if (service.image) {
    return `${service.image.split(":")[0]} Container`;
  }

  return `${name} Service`;
}

/**
 * Determine if we can exec into this container
 */
function canExecuteShell(name: string, service: DockerComposeService): boolean {
  // Infrastructure services we care about
  const execableServices = ["api", "api-dev", "web", "web-dev", "db"];

  // If it has a build, it's likely our code and we can exec into it
  if (service.build) return true;

  // If it's in our known list
  if (execableServices.includes(name)) return true;

  // Database and common infrastructure
  if (name.includes("db") || name.includes("postgres")) return true;

  // Default to false for pure infrastructure (kafka, zookeeper, etc.)
  return false;
}

/**
 * Determine if this service can be rebuilt
 */
function hasRebuildCapability(service: DockerComposeService): boolean {
  // Only services with build configurations can be rebuilt
  return !!service.build;
}

/**
 * Extract port mappings
 */
function extractPorts(service: DockerComposeService): number[] {
  if (!service.ports) return [];

  return service.ports
    .map((portMapping) => {
      // Format: "host:container" or just "port"
      const parts = portMapping.split(":");
      const hostPort = parts.length > 1 ? parts[0] : parts[0];
      // Remove any protocol suffix and parse as int
      return parseInt(hostPort.replace(/\/.+$/, ""), 10);
    })
    .filter((port) => !isNaN(port));
}

/**
 * Extract service dependencies
 */
function extractDependencies(service: DockerComposeService): string[] {
  if (!service.depends_on) return [];

  // depends_on can be an array or an object
  if (Array.isArray(service.depends_on)) {
    return service.depends_on;
  }

  if (typeof service.depends_on === "object") {
    return Object.keys(service.depends_on);
  }

  return [];
}

/**
 * Get services filtered by profile
 */
export function getServicesByProfile(
  services: Map<string, ServiceConfig>,
  profile: "dev" | "prod" | "all",
): ServiceConfig[] {
  return Array.from(services.values()).filter(
    (s) => s.profile === profile || s.profile === "all",
  );
}

/**
 * Get services that can be executed into
 */
export function getExecableServices(
  services: Map<string, ServiceConfig>,
): ServiceConfig[] {
  return Array.from(services.values()).filter((s) => s.capabilities.canExec);
}

/**
 * Get services that can be rebuilt
 */
export function getRebuildableServices(
  services: Map<string, ServiceConfig>,
): ServiceConfig[] {
  return Array.from(services.values()).filter((s) => s.capabilities.canRebuild);
}
