#!/usr/bin/env node

const { Command } = require('commander');
const chalk = require('chalk');
const { main } = require('../src/index.js');
const { bootstrap } = require('../src/bootstrap.js');

const program = new Command();

program
  .name('claude-wizard')
  .description('Interactive CLI to install Claude AI agents and bootstrap projects from templates')
  .version('0.3.1')
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
  .option('--prd <file>', 'Copy product requirement document to project')
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

// Reset configuration command
program
  .command('reset-config')
  .description('Reset configuration to defaults')
  .option('--keep-user-data', 'Preserve installed agents and preferences')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    try {
      const { resetConfig } = require('../src/utils.js');
      const inquirer = require('inquirer');

      console.log(chalk.yellow('⚠️  This will reset your Claude Wizard configuration to defaults.'));

      if (options.keepUserData) {
        console.log(chalk.cyan('📦 User data (installed agents, preferences) will be preserved.'));
      } else {
        console.log(chalk.red('🗑️  All user data (installed agents, preferences) will be lost.'));
      }

      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Are you sure you want to reset the configuration?',
        default: false
      }]);

      if (!confirm) {
        console.log(chalk.gray('Configuration reset cancelled.'));
        return;
      }

      const newConfig = await resetConfig(options.keepUserData);

      console.log(chalk.green('✅ Configuration reset successfully!'));

      if (options.verbose) {
        console.log(chalk.gray('New configuration:'));
        console.log(JSON.stringify(newConfig, null, 2));
      }

      console.log(chalk.cyan('📄 Configuration file: ~/.claude-wizard-config.json'));

    } catch (error) {
      console.error(chalk.red('Reset Error:'), error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  });

program.parse();

