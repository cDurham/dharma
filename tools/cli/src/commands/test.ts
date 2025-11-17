import { Command } from 'commander';
import { runCommandAsync, withSpinner, printError, printInfo } from '../utils/docker.js';

// Valid project names that have test targets
const TESTABLE_PROJECTS = ['api', 'web'];

export const testCommand = new Command('test')
  .description('Run tests using Vitest');

testCommand
  .argument('[project]', 'Project to test (api, web, or omit for all)', 'all')
  .action(async (project) => {
    const normalizedProject = project.toLowerCase();

    if (normalizedProject === 'all') {
      printInfo('Running tests for all projects...');
      
      await withSpinner(
        'Running tests...',
        () => runCommandAsync('npx nx run-many --target=test'),
        { 
          successMessage: 'All tests passed',
          failMessage: 'Tests failed for one or more projects'
        }
      );
    } else if (TESTABLE_PROJECTS.includes(normalizedProject)) {
      printInfo(`Running tests for ${normalizedProject}...`);
      
      await withSpinner(
        `Running tests for ${normalizedProject}...`,
        () => runCommandAsync(`npx nx run ${normalizedProject}:test`),
        {
          successMessage: `${normalizedProject} tests passed`,
          failMessage: `Tests failed for ${normalizedProject}`
        }
      );
    } else {
      printError(`Invalid project: ${project}`);
      printInfo(`Valid projects: ${TESTABLE_PROJECTS.join(', ')}, or omit for all`);
      process.exit(1);
    }
  });

