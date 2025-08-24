#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { main } = require('../src/index.js');

const program = new Command();

program
  .name('claude-agents')
  .description('Interactive CLI to install Claude AI agents from GitHub repositories')
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

program.parse();

