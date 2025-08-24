#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { main } = require('../src/index.js');
const { bootstrap } = require('../src/bootstrap.js');

const program = new Command();

program
  .name('claude-wizard')
  .description('Interactive CLI to install Claude AI agents and bootstrap projects from templates')
  .version('0.2.0')
  .option('-m, --model <model>', 'Claude model to assign (opus, sonnet, inherit, none)')
  .option('-c, --assign-colors', 'Auto-assign colors to agents without colors')
  .option('--as-commands', 'Install as commands instead of agents')
  .option('--dry-run', 'Preview what will be installed without installing')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    try {
      await main(options);
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

// Bootstrap command for project templates
program
  .command('bootstrap')
  .description('Bootstrap a new project from templates')
  .option('-t, --template <name>', 'Template name to use')
  .option('-n, --name <name>', 'Project name')
  .option('-p, --path <path>', 'Project path')
  .option('-l, --list-templates', 'List available templates')
  .option('--dry-run', 'Preview template without creating project')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    try {
      await bootstrap(options);
    } catch (error) {
      console.error(chalk.red('Bootstrap Error:'), error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

program.parse();

