import { Command } from 'commander';
import { runCommandAsync, withSpinner, createSpinner, printSuccess, printError, printInfo, execInContainer } from '../utils/docker.js';
import { serviceRegistry } from '../config/services.js';

export const devCommand = new Command('dev')
  .description('Development environment management');

devCommand
  .command('up')
  .description('Start development environment')
  .option('-b, --build', 'Build images before starting')
  .action(async (options) => {
    const cmd = options.build 
      ? 'docker compose --profile dev up -d --build'
      : 'docker compose --profile dev up -d';
    
    await withSpinner(
      'Starting development environment...',
      () => runCommandAsync(cmd),
      { successMessage: 'Development environment started' }
    );
    
    printInfo('Run "dharma logs" to view logs');
  });

devCommand
  .command('down')
  .description('Stop development environment')
  .option('-v, --volumes', 'Remove volumes')
  .action(async (options) => {
    const cmd = options.volumes
      ? 'docker compose --profile dev down -v'
      : 'docker compose --profile dev down';
    
    await withSpinner(
      'Stopping development environment...',
      () => runCommandAsync(cmd),
      { successMessage: 'Development environment stopped' }
    );
  });

devCommand
  .command('restart')
  .description('Restart development environment')
  .action(async () => {
    printInfo('Restarting development environment...');
    
    let result = await runCommandAsync('docker compose --profile dev down');
    if (!result.success) {
      printError('Failed to stop containers');
      process.exit(1);
    }
    
    result = await runCommandAsync('docker compose --profile dev up -d');
    if (result.success) {
      printSuccess('Development environment restarted');
    } else {
      printError('Failed to restart development environment');
      process.exit(1);
    }
  });

devCommand
  .command('rebuild')
  .description('Rebuild development environment')
  .argument('[service]', 'Service to rebuild (or "all")', 'all')
  .action(async (service) => {
    const rebuildableServices = serviceRegistry.getRebuildableServices();
    const resolvedService = serviceRegistry.resolveServiceName(service);
    
    if (resolvedService === 'all') {
      printInfo('Rebuilding all services...');
      
      await withSpinner(
        'Stopping containers...',
        () => runCommandAsync('docker compose --profile dev down'),
        { successMessage: 'Containers stopped' }
      );
      
      await withSpinner(
        'Building images...',
        () => runCommandAsync('docker compose --profile dev build --no-cache'),
        { successMessage: 'Images built' }
      );
      
      await withSpinner(
        'Starting containers...',
        () => runCommandAsync('docker compose --profile dev up -d'),
        { successMessage: 'Development environment rebuilt' }
      );
    } else {
      // Check if service exists and can be rebuilt
      const serviceConfig = serviceRegistry.getService(resolvedService);
      
      if (!serviceConfig) {
        printError(`Invalid service: ${service} (${resolvedService})`);
        printError(`Valid services: ${rebuildableServices.map(s => s.name).join(', ')}, all`);
        process.exit(1);
      }
      
      if (!serviceConfig.capabilities.canRebuild) {
        printError(`Cannot rebuild ${service} - no build configuration`);
        printError(`Rebuildable services: ${rebuildableServices.map(s => s.name).join(', ')}`);
        process.exit(1);
      }
      
      const displayName = serviceRegistry.getDisplayName(service);
      
      printInfo(`Rebuilding ${displayName}...`);
      
      await runCommandAsync(`docker compose --profile dev stop ${resolvedService}`);
      await runCommandAsync(`docker compose --profile dev rm -f ${resolvedService}`);
      
      const spinner = createSpinner(`Building ${displayName}...`).start();
      const buildResult = await runCommandAsync(`docker compose --profile dev build --no-cache ${resolvedService}`);
      
      if (!buildResult.success) {
        spinner.fail('Build failed');
        process.exit(1);
      }
      
      spinner.text = `Starting ${displayName}...`;
      const upResult = await runCommandAsync(`docker compose --profile dev up -d ${resolvedService}`);
      
      if (upResult.success) {
        spinner.succeed(`${displayName} rebuilt successfully`);
      } else {
        spinner.fail(`Failed to start ${displayName}`);
        process.exit(1);
      }
    }
  });

devCommand
  .command('nuke')
  .description('Complete teardown (stop, remove volumes, prune)')
  .action(async () => {
    printInfo('💣 Nuclear option - removing everything...');
    
    await withSpinner(
      'Stopping containers...',
      () => runCommandAsync('docker compose --profile dev down -v'),
      { successMessage: 'Containers stopped and volumes removed' }
    );
    
    await withSpinner(
      'Pruning volumes...',
      () => runCommandAsync('docker volume prune -f'),
      { successMessage: 'Volumes pruned' }
    );
    
    printSuccess('Environment completely removed');
  });

devCommand
  .command('reset')
  .description('Full teardown and rebuild with fresh database')
  .option('--skip-seed', 'Skip database seeding')
  .action(async (options) => {
    printInfo('🔄 Full reset - this will take a moment...');
    
    // Nuke
    const spinner = createSpinner('Removing existing environment...').start();
    await runCommandAsync('docker compose --profile dev down -v');
    await runCommandAsync('docker volume prune -f');
    spinner.succeed('Environment removed');
    
    // Build and start
    await withSpinner(
      'Building and starting containers...',
      () => runCommandAsync('docker compose --profile dev up -d --build'),
      { successMessage: 'Containers started' }
    );
    
    // Wait for containers to be ready
    await withSpinner(
      'Waiting for services to be ready...',
      () => new Promise<{ success: boolean }>(resolve => 
        setTimeout(() => resolve({ success: true }), 5000)
      ),
      { successMessage: 'Services ready' }
    );
    
    // Push schema
    await withSpinner(
      'Pushing database schema...',
      () => Promise.resolve(execInContainer('api-dev', 'npm run db:push')),
      { successMessage: 'Database schema pushed' }
    );
    
    // Seed (unless skipped)
    if (!options.skipSeed) {
      await withSpinner(
        'Seeding database...',
        () => Promise.resolve(execInContainer('api-dev', 'npm run db:seed')),
        { successMessage: 'Database seeded' }
      );
    }
    
    printSuccess('✨ Environment reset complete!');
    printInfo('Run "dharma logs" to view logs');
  });

