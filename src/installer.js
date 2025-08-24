const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const { GitHubAPI } = require('./github.js');
const { processAgentContent, convertToCommand, loadConfig, saveConfig } = require('./utils.js');

class Installer {
  constructor() {
    this.github = new GitHubAPI();
  }

  async installAgents(selectedAgents, targetPath, repository, options = {}) {
    const spinner = ora('Downloading and processing agents...').start();

    try {
      await fs.ensureDir(targetPath);

      const results = {
        installed: [],
        failed: [],
        skipped: []
      };

      for (const item of selectedAgents) {
        try {
          spinner.text = `Processing ${item.agent.name}...`;

          // Download agent content from GitHub
          const content = await this.github.downloadAgent(
            repository.url,
            item.agent.path,
            repository.branch
          );

          // Process content based on installation type
          let processedContent;
          let filename;

          if (options.installationType === 'commands') {
            processedContent = convertToCommand(content);
            filename = `${item.agent.name}.md`;
          } else {
            processedContent = processAgentContent(content, options);
            filename = `${item.agent.name}.md`;
          }

          // Create department directory if needed
          const departmentPath = path.join(targetPath, item.department);
          await fs.ensureDir(departmentPath);

          // Write file
          const filePath = path.join(departmentPath, filename);
          await fs.writeFile(filePath, processedContent, 'utf8');

          results.installed.push({
            name: item.agent.name,
            department: item.department,
            path: filePath
          });

        } catch (error) {
          results.failed.push({
            name: item.agent.name,
            error: error.message
          });
        }
      }

      spinner.succeed('Installation complete!');

      // Display results
      if (results.installed.length > 0) {
        console.log(chalk.green(`✓ ${results.installed.length} agents installed successfully`));
        if (options.installationType === 'commands') {
          console.log(chalk.blue('  Restart Claude Code to load the new commands.'));
        } else {
          console.log(chalk.blue('  Restart Claude Code to load the new agents.'));
        }
      }

      if (results.failed.length > 0) {
        console.log(chalk.red(`✗ ${results.failed.length} agents failed to install:`));
        results.failed.forEach(item => {
          console.log(chalk.red(`  - ${item.name}: ${item.error}`));
        });
      }

      return results;

    } catch (error) {
      spinner.fail('Installation failed');
      throw error;
    }
  }

  async updateAgents(_targetPath) {
    // Implementation for updating existing agents
    const spinner = ora('Checking for updates...').start();

    try {
      // Logic to compare installed agents with GitHub versions
      // and offer selective updates
      spinner.succeed('Update check complete');
    } catch (error) {
      spinner.fail('Update check failed');
      throw error;
    }
  }

  async removeAgents(agentsToRemove, targetPath) {
    const spinner = ora('Removing agents...').start();

    try {
      // Load config to update installed agents list
      const config = await loadConfig();

      for (const agent of agentsToRemove) {
        const filePath = path.join(targetPath, agent.department, `${agent.name}.md`);

        // Remove from filesystem if exists
        if (await fs.pathExists(filePath)) {
          await fs.remove(filePath);
        }

        // Remove from config installedAgents array
        config.installedAgents = config.installedAgents.filter(installed =>
          !(installed.name === agent.name && installed.department === agent.department)
        );

        // Also remove from installedCommands if exists
        config.installedCommands = config.installedCommands.filter(installed =>
          !(installed.name === agent.name && installed.department === agent.department)
        );
      }

      // Save updated config
      await saveConfig(config);

      spinner.succeed(`Removed ${agentsToRemove.length} agents`);
    } catch (error) {
      spinner.fail('Removal failed');
      throw error;
    }
  }

  async listInstalledAgents(targetPath) {
    try {
      // Load config to get installed agents list
      const config = await loadConfig();

      // Return agents from config that should be installed as agents (not commands)
      const installedAgents = config.installedAgents || [];

      // Add file path and check if files actually exist
      const agentsWithPaths = [];

      for (const agent of installedAgents) {
        const filePath = path.join(targetPath, agent.department, `${agent.name}.md`);
        const exists = await fs.pathExists(filePath);

        agentsWithPaths.push({
          name: agent.name,
          department: agent.department,
          path: filePath,
          exists: exists,
          installedAt: agent.installedAt,
          source: agent.source
        });
      }

      return agentsWithPaths;
    } catch (error) {
      throw new Error(`Failed to list installed agents: ${error.message}`);
    }
  }

  async syncConfigWithFilesystem(targetPath) {
    try {
      const config = await loadConfig();

      // Check for orphaned config entries (in config but not on filesystem)
      const updatedInstalledAgents = [];
      const updatedInstalledCommands = [];

      // Sync agents
      for (const agent of (config.installedAgents || [])) {
        const filePath = path.join(targetPath, agent.department, `${agent.name}.md`);
        if (await fs.pathExists(filePath)) {
          updatedInstalledAgents.push(agent);
        }
      }

      // Sync commands
      const commandsPath = targetPath.replace('/agents', '/commands');
      for (const command of (config.installedCommands || [])) {
        const filePath = path.join(commandsPath, `${command.name}.md`);
        if (await fs.pathExists(filePath)) {
          updatedInstalledCommands.push(command);
        }
      }

      // Update config if anything changed
      const agentsChanged = (config.installedAgents || []).length !== updatedInstalledAgents.length;
      const commandsChanged = (config.installedCommands || []).length !== updatedInstalledCommands.length;

      if (agentsChanged || commandsChanged) {
        config.installedAgents = updatedInstalledAgents;
        config.installedCommands = updatedInstalledCommands;
        await saveConfig(config);

        const removedAgents = (config.installedAgents || []).length - updatedInstalledAgents.length;
        const removedCommands = (config.installedCommands || []).length - updatedInstalledCommands.length;

        console.log(chalk.yellow(`🔄 Synced config: removed ${removedAgents} orphaned agents, ${removedCommands} orphaned commands`));
      }

      return { agentsChanged, commandsChanged };
    } catch (error) {
      throw new Error(`Failed to sync config with filesystem: ${error.message}`);
    }
  }
}

module.exports = { Installer };

