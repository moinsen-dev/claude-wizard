const inquirer = require('inquirer');
const chalk = require('chalk');
const os = require('os');
const path = require('path');

class Prompts {
  async selectAction() {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Browse available agents', value: 'browse' },
          { name: 'Install agents', value: 'install' },
          { name: 'Update agents', value: 'update' },
          { name: 'Remove agents', value: 'remove' },
          { name: 'List installed agents', value: 'list' },
          { name: 'Configure repositories', value: 'configure' }
        ]
      }
    ]);
    return action;
  }


  async selectInstallLocation(installationType) {
    const agentsDir = installationType === 'agents' ? 'agents' : 'commands';
    const currentDir = process.cwd();

    const { location } = await inquirer.prompt([
      {
        type: 'list',
        name: 'location',
        message: 'Where to install?',
        choices: [
          {
            name: `Project (./.claude/${agentsDir})`,
            value: path.join(currentDir, '.claude', agentsDir)
          },
          {
            name: `Global (~/.claude/${agentsDir})`,
            value: path.join(os.homedir(), '.claude', agentsDir)
          }
        ]
      }
    ]);

    return location;
  }

  async selectInstallMethod() {
    const { method } = await inquirer.prompt([
      {
        type: 'list',
        name: 'method',
        message: 'Select installation method:',
        choices: [
          { name: 'All agents', value: 'all' },
          { name: 'By department', value: 'department' },
          { name: 'Individual agents', value: 'individual' },
          { name: 'Search agents', value: 'search' }
        ]
      }
    ]);
    return method;
  }

  async selectDepartments(availableDepartments) {
    const choices = Object.keys(availableDepartments).map(dept => ({
      name: `${dept} (${availableDepartments[dept].length} agents)`,
      value: dept,
      checked: false
    }));

    const { departments } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'departments',
        message: 'Select departments: (Press <space> to select)',
        choices,
        validate: (answer) => answer.length > 0 ? true : 'You must select at least one department'
      }
    ]);

    return departments;
  }

  async selectIndividualAgents(allAgents) {
    const choices = [];

    Object.keys(allAgents).forEach(dept => {
      choices.push(new inquirer.Separator(`--- ${dept.toUpperCase()} ---`));
      allAgents[dept].forEach(agent => {
        choices.push({
          name: agent.name,
          value: { department: dept, agent },
          checked: false
        });
      });
    });

    const { selectedAgents } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedAgents',
        message: 'Select individual agents:',
        choices,
        pageSize: 15,
        validate: (answer) => answer.length > 0 ? true : 'You must select at least one agent'
      }
    ]);

    return selectedAgents;
  }

  async searchAgents(allAgents, keyword) {
    const matchingAgents = [];

    Object.keys(allAgents).forEach(dept => {
      allAgents[dept].forEach(agent => {
        if (agent.name.toLowerCase().includes(keyword.toLowerCase()) ||
            (agent.description && agent.description.toLowerCase().includes(keyword.toLowerCase()))) {
          matchingAgents.push({ department: dept, agent });
        }
      });
    });

    if (matchingAgents.length === 0) {
      console.log(chalk.yellow(`No agents found matching "${keyword}"`));
      return [];
    }

    const choices = matchingAgents.map(item => ({
      name: `${item.agent.name} (${item.department})`,
      value: item,
      checked: false
    }));

    const { selectedAgents } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedAgents',
        message: `Found ${matchingAgents.length} matching agents:`,
        choices,
        validate: (answer) => answer.length > 0 ? true : 'You must select at least one agent'
      }
    ]);

    return selectedAgents;
  }

  async getSearchKeyword() {
    const { keyword } = await inquirer.prompt([
      {
        type: 'input',
        name: 'keyword',
        message: 'Enter search keyword:',
        validate: (input) => input.trim() ? true : 'Keyword cannot be empty'
      }
    ]);
    return keyword.trim();
  }

  async confirmInstallation(summary) {
    console.log(chalk.cyan('\n📋 Review selection:'));
    console.log(chalk.white(`  Installing ${summary.count} items to ${summary.targetPath}`));
    console.log(chalk.white(`  Source: ${summary.repository}`));
    if (summary.installationType === 'commands') {
      console.log(chalk.white('  Format: Commands (YAML removed, markdown headers added)'));
    } else {
      if (summary.model) {
        console.log(chalk.white(`  Model: ${summary.model} (will be added to all agents)`));
      }
      if (summary.assignColors) {
        console.log(chalk.white('  Auto-assign colors: Yes'));
      }
    }

    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: 'Continue?',
        default: true
      }
    ]);

    return confirmed;
  }

  // Configuration Management Methods
  async selectConfigurationAction() {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Configuration options:',
        choices: [
          { name: 'Manage repositories', value: 'repositories' },
          { name: 'Set default preferences', value: 'preferences' },
          { name: 'View current configuration', value: 'view' },
          { name: 'Reset to defaults', value: 'reset' },
          { name: 'Back to main menu', value: 'back' }
        ]
      }
    ]);
    return action;
  }

  async selectRepositoryAction(repositories) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'Repository management:',
        choices: [
          { name: 'Add new repository', value: 'add' },
          { name: 'Edit existing repository', value: 'edit' },
          { name: 'Remove repository', value: 'remove' },
          { name: 'Set default repository', value: 'default' },
          { name: `View repositories (${repositories.length})`, value: 'list' },
          { name: 'Back to configuration menu', value: 'back' }
        ]
      }
    ]);
    return action;
  }

  async addRepository() {
    console.log(chalk.cyan('\n➕ Add New Repository'));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Repository name:',
        validate: (input) => input.trim() ? true : 'Name cannot be empty'
      },
      {
        type: 'input',
        name: 'url',
        message: 'GitHub repository URL:',
        validate: (input) => {
          if (!input.trim()) return 'URL cannot be empty';
          if (!input.includes('github.com')) return 'Must be a GitHub repository URL';
          return true;
        }
      },
      {
        type: 'input',
        name: 'branch',
        message: 'Branch name:',
        default: 'main'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (optional):',
        default: ''
      }
    ]);

    return answers;
  }

  async selectRepository(repositories, message = 'Select repository:') {
    if (repositories.length === 0) {
      console.log(chalk.yellow('No repositories configured.'));
      return null;
    }

    const choices = repositories.map((repo, index) => ({
      name: `${repo.name} (${repo.url})${repo.default ? ' [DEFAULT]' : ''}`,
      value: index
    }));

    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message,
        choices
      }
    ]);

    return selected;
  }

  async editRepository(repository) {
    console.log(chalk.cyan(`\n✏️  Edit Repository: ${repository.name}`));

    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Repository name:',
        default: repository.name,
        validate: (input) => input.trim() ? true : 'Name cannot be empty'
      },
      {
        type: 'input',
        name: 'url',
        message: 'GitHub repository URL:',
        default: repository.url,
        validate: (input) => {
          if (!input.trim()) return 'URL cannot be empty';
          if (!input.includes('github.com')) return 'Must be a GitHub repository URL';
          return true;
        }
      },
      {
        type: 'input',
        name: 'branch',
        message: 'Branch name:',
        default: repository.branch || 'main'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description (optional):',
        default: repository.description || ''
      }
    ]);

    return answers;
  }

  async confirmRepositoryRemoval(repository) {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: `Remove repository "${repository.name}"?`,
        default: false
      }
    ]);
    return confirmed;
  }

  async selectPreferences(currentPreferences) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'defaultModel',
        message: 'Default model for new agents:',
        choices: [
          { name: 'Inherit (use Claude Code default)', value: 'inherit' },
          { name: 'Claude Opus', value: 'opus' },
          { name: 'Claude Sonnet', value: 'sonnet' },
          { name: 'None (no model specified)', value: 'none' }
        ],
        default: currentPreferences.defaultModel || 'inherit'
      },
      {
        type: 'confirm',
        name: 'autoAssignColors',
        message: 'Automatically assign colors to agents without colors?',
        default: currentPreferences.autoAssignColors || false
      },
      {
        type: 'confirm',
        name: 'confirmBeforeInstall',
        message: 'Show confirmation before installing agents?',
        default: currentPreferences.confirmBeforeInstall !== false
      },
      {
        type: 'confirm',
        name: 'showDescriptions',
        message: 'Show agent descriptions during selection?',
        default: currentPreferences.showDescriptions !== false
      },
      {
        type: 'number',
        name: 'cacheTimeout',
        message: 'GitHub API cache timeout (seconds):',
        default: currentPreferences.cacheTimeout || 3600,
        validate: (input) => input > 0 ? true : 'Must be greater than 0'
      }
    ]);

    return answers;
  }

  async confirmReset() {
    console.log(chalk.yellow('\n⚠️  This will reset ALL configuration to defaults!'));
    console.log(chalk.gray('  - All custom repositories will be removed'));
    console.log(chalk.gray('  - All preferences will be reset'));
    console.log(chalk.gray('  - Installation history will be cleared'));

    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: 'Are you sure you want to reset configuration?',
        default: false
      }
    ]);
    return confirmed;
  }

  // Agent browsing methods
  async selectBrowseAction(totalAgents, departmentCount) {
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: `Browse ${totalAgents} agents across ${departmentCount} departments:`,
        choices: [
          { name: 'Browse by department', value: 'department' },
          { name: 'Browse all agents', value: 'all' },
          { name: 'Search agents', value: 'search' },
          { name: 'View agent details', value: 'details' },
          { name: 'Back to main menu', value: 'back' }
        ]
      }
    ]);
    return action;
  }

  async selectDepartmentToBrowse(availableAgents) {
    const choices = Object.keys(availableAgents).map(dept => ({
      name: `${dept} (${availableAgents[dept].length} agents)`,
      value: dept
    }));

    choices.push({ name: 'Back to browse menu', value: 'back' });

    const { department } = await inquirer.prompt([
      {
        type: 'list',
        name: 'department',
        message: 'Select department to browse:',
        choices
      }
    ]);

    return department;
  }

  async selectAgentToView(agents, department = null) {
    const choices = agents.map(agent => ({
      name: agent.name,
      value: agent
    }));

    choices.push({ name: 'Back', value: 'back' });

    const title = department ? `${department} agents:` : 'Select agent to view:';

    const { agent } = await inquirer.prompt([
      {
        type: 'list',
        name: 'agent',
        message: title,
        choices,
        pageSize: 15
      }
    ]);

    return agent;
  }

  async selectAgentForDetails(allAgents) {
    const choices = [];

    Object.keys(allAgents).forEach(dept => {
      choices.push(new inquirer.Separator(`--- ${dept.toUpperCase()} ---`));
      allAgents[dept].forEach(agent => {
        choices.push({
          name: agent.name,
          value: { department: dept, agent }
        });
      });
    });

    choices.push(new inquirer.Separator('---'));
    choices.push({ name: 'Back to browse menu', value: 'back' });

    const { selected } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selected',
        message: 'Select agent to view details:',
        choices,
        pageSize: 15
      }
    ]);

    return selected;
  }

  async confirmContinueBrowsing() {
    const { confirmed } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: 'Continue browsing agents?',
        default: true
      }
    ]);
    return confirmed;
  }
}

module.exports = { Prompts };

