import { Command } from 'commander';
import prompts from 'prompts';
import { runCommandAsync, printError } from '../utils/docker.js';
import { serviceRegistry } from '../config/services.js';

export const execCommand = new Command('exec')
  .description('Execute command in a container')
  .argument('[service]', 'Service to exec into')
  .argument('[command...]', 'Command to run (defaults to sh)')
  .action(async (service?: string, commandArgs: string[] = []) => {
    let selectedService = service;
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

    const command = commandArgs.length > 0 ? commandArgs.join(' ') : 'sh';
    
    await runCommandAsync(`docker exec -it ${containerName} ${command}`);
  });

