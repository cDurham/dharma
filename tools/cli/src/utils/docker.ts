import { execSync, spawn } from 'child_process';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { serviceRegistry } from '../config/services.js';

export type CommandResult = { success: boolean; output?: string; error?: unknown; code?: number | null };

export function runCommand(command: string, options: { silent?: boolean; stdio?: 'inherit' | 'pipe' } = {}): CommandResult {
  try {
    const result = execSync(command, {
      cwd: process.cwd(),
      stdio: options.stdio || (options.silent ? 'pipe' : 'inherit'),
      encoding: 'utf-8',
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error };
  }
}

export function runCommandAsync(
  command: string,
  options: { stdio?: 'inherit' | 'pipe' } = {}
): Promise<CommandResult> {
  return new Promise((resolve) => {
    const child = spawn(command, {
      shell: true,
      cwd: process.cwd(),
      stdio: options.stdio || 'inherit',
    });

    child.on('close', (code) => {
      resolve({ success: code === 0, code });
    });

    child.on('error', () => {
      resolve({ success: false, code: null });
    });
  });
}

/**
 * Run a command with a spinner. Auto-handles success/failure.
 */
export async function withSpinner(
  message: string,
  fn: () => Promise<CommandResult>,
  options: { 
    successMessage?: string; 
    failMessage?: string;
    exitOnFailure?: boolean;
  } = {}
): Promise<CommandResult> {
  const { 
    successMessage = message.replace(/\.\.\.$/, ''), 
    failMessage = `Failed: ${message.replace(/\.\.\.$/, '')}`,
    exitOnFailure = true 
  } = options;
  
  const spinner = ora(message).start();
  const result = await fn();
  
  if (result.success) {
    spinner.succeed(successMessage);
  } else {
    spinner.fail(failMessage);
    if (exitOnFailure) {
      process.exit(1);
    }
  }
  
  return result;
}

/**
 * Create a spinner for manual control
 */
export function createSpinner(message: string): Ora {
  return ora(message);
}

export function getContainerStatus(): Record<string, { running: boolean; status?: string }> {
  const result = runCommand('docker ps -a --format "{{.Names}}||{{.Status}}"', { silent: true });
  
  if (!result.success || !result.output) {
    return {};
  }

  const status: Record<string, { running: boolean; status?: string }> = {};
  const knownContainers = serviceRegistry.getAllServices().map(s => s.containerName);
  
  result.output.split('\n').forEach((line) => {
    const [name, statusText] = line.split('||');
    if (name && knownContainers.includes(name)) {
      status[name] = {
        running: statusText?.toLowerCase().includes('up') || false,
        status: statusText,
      };
    }
  });

  return status;
}

export function printSuccess(message: string) {
  console.log(chalk.green('✓'), message);
}

export function printError(message: string) {
  console.log(chalk.red('✗'), message);
}

export function printInfo(message: string) {
  console.log(chalk.blue('ℹ'), message);
}

export function printWarning(message: string) {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Execute a command inside a container, with smart error handling
 */
export function execInContainer(serviceName: string, command: string): CommandResult {
  const service = serviceRegistry.getService(serviceName);
  
  if (!service) {
    printError(`Service "${serviceName}" not found`);
    return { success: false, error: `Unknown service: ${serviceName}` };
  }

  // Check if container is running
  const status = getContainerStatus();
  const containerStatus = status[service.containerName];

  if (!containerStatus) {
    printError(`Container "${service.containerName}" does not exist`);
    printInfo(`Run 'dharma dev up' to start the environment`);
    return { success: false, error: 'Container not found' };
  }

  if (!containerStatus.running) {
    printError(`Container "${service.containerName}" is not running`);
    printInfo(`Run 'dharma dev up' to start the environment`);
    return { success: false, error: 'Container not running' };
  }

  // Execute command in container
  const fullCommand = `docker exec ${service.containerName} ${command}`;
  return runCommand(fullCommand);
}

/**
 * Open an interactive shell inside a container
 */
export async function execShellInContainer(
  serviceName: string,
  shell: 'bash' | 'sh' = 'bash'
): Promise<CommandResult> {
  const service = serviceRegistry.getService(serviceName);

  if (!service) {
    printError(`Service "${serviceName}" not found`);
    return { success: false, error: `Unknown service: ${serviceName}` };
  }

  const status = getContainerStatus();
  const containerStatus = status[service.containerName];

  if (!containerStatus) {
    printError(`Container "${service.containerName}" does not exist`);
    printInfo(`Run 'dharma dev up' to start the environment`);
    return { success: false, error: 'Container not found' };
  }

  if (!containerStatus.running) {
    printError(`Container "${service.containerName}" is not running`);
    printInfo(`Run 'dharma dev up' to start the environment`);
    return { success: false, error: 'Container not running' };
  }

  // Prefer bash, fall back to sh if bash fails
  const command = shell === 'bash'
    ? `docker exec -it ${service.containerName} bash || docker exec -it ${service.containerName} sh`
    : `docker exec -it ${service.containerName} ${shell}`;

  return runCommandAsync(command);
}
