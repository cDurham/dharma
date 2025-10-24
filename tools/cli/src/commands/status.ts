import { Command } from 'commander';
import chalk from 'chalk';
import { getContainerStatus } from '../utils/docker.js';
import { serviceRegistry } from '../config/services.js';

export const statusCommand = new Command('status')
  .description('Show status of all services')
  .alias('ps')
  .action(() => {
    const containerStatus = getContainerStatus();
    const allServices = serviceRegistry.getAllServices();
    
    console.log('\n' + chalk.bold('Dharma Services Status') + '\n');
    console.log(chalk.gray('─'.repeat(90)) + '\n');
    
    // Header
    console.log(
      chalk.bold('Service').padEnd(15) +
      chalk.bold('Description').padEnd(30) +
      chalk.bold('Container').padEnd(25) +
      chalk.bold('Status')
    );
    console.log(chalk.gray('─'.repeat(90)));
    
    // Services
    allServices.forEach(service => {
      const status = containerStatus[service.containerName];
      const isRunning = status?.running || false;
      const statusText = status?.status || 'Not found';
      
      const statusColor = isRunning ? chalk.green : chalk.red;
      const statusIcon = isRunning ? '●' : '○';
      
      // Truncate description if too long
      const description = service.description.length > 28 
        ? service.description.substring(0, 25) + '...'
        : service.description;
      
      console.log(
        chalk.cyan(service.name.padEnd(15)) +
        chalk.white(description.padEnd(30)) +
        chalk.gray(service.containerName.padEnd(25)) +
        statusColor(`${statusIcon} ${statusText}`)
      );
    });
    
    console.log('\n' + chalk.gray('─'.repeat(90)) + '\n');
    
    // Summary
    const runningCount = Object.values(containerStatus).filter(s => s.running).length;
    const totalCount = allServices.length;
    
    if (runningCount === totalCount) {
      console.log(chalk.green(`✓ All services running (${runningCount}/${totalCount})`));
    } else if (runningCount > 0) {
      console.log(chalk.yellow(`⚠ Some services running (${runningCount}/${totalCount})`));
    } else {
      console.log(chalk.red(`✗ No services running (0/${totalCount})`));
    }
    
    console.log();
  });

