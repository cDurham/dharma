import { parseDockerCompose, ServiceConfig } from './docker-compose-parser.js';
import { resolve, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';

/**
 * Service name aliases for convenience
 * Maps short names to full service names in dev mode
 */
const SERVICE_ALIASES: Record<string, string> = {
  'api': 'api-dev',
  'web': 'web-dev',
};

/**
 * Service Registry - Singleton that loads services from docker-compose.yml
 */
class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, ServiceConfig>;
  private projectRoot: string;

  private constructor() {
    this.projectRoot = resolveProjectRoot();
    this.services = parseDockerCompose(this.projectRoot);
  }

  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }

  /**
   * Reload services from docker-compose.yml
   */
  public reload(): void {
    this.services = parseDockerCompose(this.projectRoot);
  }

  /**
   * Get a service by name
   */
  public getService(name: string): ServiceConfig | undefined {
    return this.services.get(name);
  }

  /**
   * Get all services
   */
  public getAllServices(): ServiceConfig[] {
    return Array.from(this.services.values());
  }

  /**
   * Get all service names
   */
  public getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Get services by profile
   */
  public getServicesByProfile(profile: 'dev' | 'prod' | 'all'): ServiceConfig[] {
    return this.getAllServices().filter(
      s => s.profile === profile || s.profile === 'all'
    );
  }

  /**
   * Get services that can be executed into
   */
  public getExecableServices(): ServiceConfig[] {
    return this.getAllServices().filter(s => s.capabilities.canExec);
  }

  /**
   * Get services that can be rebuilt
   */
  public getRebuildableServices(): ServiceConfig[] {
    return this.getAllServices().filter(s => s.capabilities.canRebuild);
  }

  /**
   * Get container name for a service
   */
  public getContainerName(serviceName: string): string | undefined {
    return this.services.get(serviceName)?.containerName;
  }

  /**
   * Check if a service exists
   */
  public hasService(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Resolve a service name, applying aliases if needed
   */
  public resolveServiceName(name: string): string {
    return SERVICE_ALIASES[name] || name;
  }

  /**
   * Resolve multiple service names, applying aliases if needed
   */
  public resolveServiceNames(names: string[]): string[] {
    return names.map(name => this.resolveServiceName(name));
  }

  /**
   * Get the display name for a service (shows alias if used)
   */
  public getDisplayName(requestedName: string): string {
    const resolvedName = this.resolveServiceName(requestedName);
    return requestedName !== resolvedName ? `${requestedName} (${resolvedName})` : requestedName;
  }
}

// Export singleton instance
export const serviceRegistry = ServiceRegistry.getInstance();

// Export aliases for reference
export { SERVICE_ALIASES };

// Export type for use in other files
export type { ServiceConfig } from './docker-compose-parser.js';

function resolveProjectRoot(): string {
  const explicit = process.env.DHARMA_PROJECT_ROOT;
  if (explicit && hasCompose(explicit)) {
    return explicit;
  }

  const cwd = process.cwd();
  if (hasCompose(cwd)) {
    return cwd;
  }

  const currentDir = dirname(fileURLToPath(import.meta.url));
  const bundledRoot = resolve(currentDir, '../../../../');
  if (hasCompose(bundledRoot)) {
    return bundledRoot;
  }

  throw new Error(
    "Could not locate docker-compose.yml. Run the CLI from the repository root or set DHARMA_PROJECT_ROOT."
  );
}

function hasCompose(dir: string): boolean {
  return existsSync(resolve(dir, 'docker-compose.yml'));
}

