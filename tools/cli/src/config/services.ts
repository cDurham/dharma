import { parseDockerCompose, ServiceConfig } from './docker-compose-parser.js';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

/**
 * Service Registry - Singleton that loads services from docker-compose.yml
 */
class ServiceRegistry {
  private static instance: ServiceRegistry;
  private services: Map<string, ServiceConfig>;
  private projectRoot: string;

  private constructor() {
    // Get project root in ES module context
    // Current file: tools/cli/dist/config/services.js
    // Project root: 4 levels up
    const currentDir = dirname(fileURLToPath(import.meta.url));
    this.projectRoot = resolve(currentDir, '../../../../');
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
}

// Export singleton instance
export const serviceRegistry = ServiceRegistry.getInstance();

// Export type for use in other files
export type { ServiceConfig } from './docker-compose-parser.js';

