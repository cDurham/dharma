import { Command } from 'commander';
import prompts from 'prompts';
import { runCommandAsync, printError } from '../utils/docker.js';
import { serviceRegistry } from '../config/services.js';

export const execCommand = new Command('exec')
  .description('Execute command in a container')
  .argument('[service]', 'Service to exec into')
  .argument('[command...]', 'Command to run (defaults to sh)')
  .allowUnknownOption(true) // Allow flags to pass through to the container command
  .action(async (service?: string, commandArgs: string[] = []) => {
    let selectedService = service ? serviceRegistry.resolveServiceName(service) : undefined;
    const execableServices = serviceRegistry.getExecableServices();

    // If no service specified, prompt user
    if (!selectedService) {
      const choices = execableServices.map(svc => ({
        title: `${svc.description} (${svc.name})`,
        value: svc.name,
      }));

      const response = await prompts({
        type: 'select',
        name: 'service',
        message: 'Select service to exec into:',
        choices,
      });

      if (!response.service) {
        process.exit(0);
      }

      selectedService = response.service;
    }

    // Validate service exists
    if (!selectedService || !serviceRegistry.hasService(selectedService)) {
      printError(`Invalid service: ${selectedService || 'none'}`);
      printError(`Valid services: ${serviceRegistry.getServiceNames().join(', ')}`);
      process.exit(1);
    }

    // Check if service can be exec'd into
    const serviceConfig = serviceRegistry.getService(selectedService);
    if (!serviceConfig?.capabilities.canExec) {
      printError(`Cannot exec into ${selectedService} - not an execable service`);
      printError(`Execable services: ${execableServices.map(s => s.name).join(', ')}`);
      process.exit(1);
    }

    const containerName = serviceRegistry.getContainerName(selectedService);
    if (!containerName) {
      printError(`Could not find container for service: ${selectedService}`);
      process.exit(1);
    }

    // Build command with proper argument escaping
    const command = commandArgs.length > 0 ? commandArgs : ['sh'];
    
    // Only use -it flags if we have a TTY (interactive mode)
    const isTTY = process.stdin.isTTY && process.stdout.isTTY;
    const dockerArgs = ['docker', 'exec'];
    if (isTTY) {
      dockerArgs.push('-it');
    }
    dockerArgs.push(containerName, ...command);
    
    // Use spawn with array arguments for proper escaping
    const { spawn } = await import('child_process');
    const child = spawn(dockerArgs[0], dockerArgs.slice(1), {
      stdio: 'inherit',
      shell: false, // Don't use shell to avoid escaping issues
    });

    child.on('error', (error) => {
      printError(`Failed to execute command: ${error.message}`);
      process.exit(1);
    });

    child.on('exit', (code) => {
      process.exit(code || 0);
    });
  });

