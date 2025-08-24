const chalk = require('chalk');
const ora = require('ora');
const { GitHubAPI } = require('./github.js');
const { Installer } = require('./installer.js');
const { Prompts } = require('./prompts.js');
const { loadConfig, saveConfig } = require('./utils.js');

async function main(cliOptions = {}) {
  console.log(chalk.blue.bold('\n🤖 Claude Agents CLI\n'));

  try {
    // Load configuration
    const config = await loadConfig();
    const github = new GitHubAPI();
    const installer = new Installer();
    const prompts = new Prompts();

    // Override CLI options with command line flags
    const options = {
      model: cliOptions.model,
      assignColors: cliOptions.assignColors,
      installationType: cliOptions.asCommands ? 'commands' : 'agents',
      dryRun: cliOptions.dryRun,
      verbose: cliOptions.verbose
    };

    // Fetch agents from default repository
    const spinner = ora('Fetching latest agents from GitHub...').start();

    const defaultRepo = config.repositories.find(r => r.default) || config.repositories[0];
    if (!defaultRepo) {
      throw new Error('No repositories configured');
    }

    let availableAgents;
    try {
      availableAgents = await github.fetchRepositoryStructure(defaultRepo.url, defaultRepo.branch);
      const totalAgents = Object.values(availableAgents).reduce((sum, agents) => sum + agents.length, 0);
      spinner.succeed(`Found ${totalAgents} agents across ${Object.keys(availableAgents).length} departments`);
    } catch (error) {
      spinner.fail('Failed to fetch agents from GitHub');
      throw error;
    }

    // Interactive flow
    const action = await prompts.selectAction();

    switch (action) {
    case 'browse':
      await handleBrowseAgents(availableAgents, defaultRepo, prompts, github);
      break;

    case 'install':
      await handleInstallation(availableAgents, defaultRepo, options, prompts, installer, config);
      break;

    case 'update':
      await handleUpdate(installer, config);
      break;

    case 'remove':
      await handleRemoval(installer, prompts, config);
      break;

    case 'list':
      await handleList(installer, config);
      break;

    case 'configure':
      await handleConfiguration(config, prompts);
      break;

    default:
      console.log(chalk.yellow('Unknown action'));
    }

  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error(chalk.red('Network error: Please check your internet connection'));
    } else {
      console.error(chalk.red('Error:'), error.message);
      if (cliOptions.verbose) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  }
}

async function handleBrowseAgents(availableAgents, repository, prompts, github) {
  const totalAgents = Object.values(availableAgents).reduce((sum, agents) => sum + agents.length, 0);
  const departmentCount = Object.keys(availableAgents).length;

  let browseAction;
  do {
    browseAction = await prompts.selectBrowseAction(totalAgents, departmentCount);

    switch (browseAction) {
    case 'department': {
      const department = await prompts.selectDepartmentToBrowse(availableAgents);
      if (department !== 'back') {
        await browseDepartment(availableAgents[department], department, prompts, github, repository);
      }
      break;
    }

    case 'all':
      await browseAllAgents(availableAgents, prompts, github, repository);
      break;

    case 'search': {
      const keyword = await prompts.getSearchKeyword();
      const matchingAgents = await prompts.searchAgents(availableAgents, keyword);
      if (matchingAgents.length > 0) {
        await displayAgentsList(matchingAgents, 'Search Results');
      }
      break;
    }

    case 'details': {
      const selected = await prompts.selectAgentForDetails(availableAgents);
      if (selected !== 'back') {
        await displayAgentDetails(selected.agent, selected.department, github, repository);
      }
      break;
    }

    case 'back':
      break;

    default:
      console.log(chalk.yellow('Unknown browse action'));
    }
  } while (browseAction !== 'back');
}

async function browseDepartment(agents, department, prompts, github, repository) {
  console.log(chalk.cyan(`\n📁 ${department.toUpperCase()} Department (${agents.length} agents)`));

  displayAgentsList(agents.map(agent => ({ agent, department })), department);

  const agent = await prompts.selectAgentToView(agents, department);
  if (agent !== 'back') {
    await displayAgentDetails(agent, department, github, repository);
  }
}

async function browseAllAgents(availableAgents, prompts, github, repository) {
  console.log(chalk.cyan('\n📋 All Available Agents'));

  Object.keys(availableAgents).forEach(dept => {
    console.log(chalk.white(`\n${dept.toUpperCase()}:`));
    availableAgents[dept].forEach(agent => {
      console.log(chalk.gray(`  • ${agent.name}`));
    });
  });

  const selected = await prompts.selectAgentForDetails(availableAgents);
  if (selected !== 'back') {
    await displayAgentDetails(selected.agent, selected.department, github, repository);
  }
}

function displayAgentsList(agentsList, title) {
  console.log(chalk.white(`\n${title}:`));
  agentsList.forEach(item => {
    const prefix = item.department ? `[${item.department}]` : '';
    console.log(chalk.gray(`  • ${prefix} ${item.agent.name}`));
  });
}

async function displayAgentDetails(agent, department, github, repository) {
  console.log(chalk.cyan(`\n🔍 Agent Details: ${agent.name}`));
  console.log(chalk.white(`Department: ${department}`));
  console.log(chalk.white(`File: ${agent.path}`));

  try {
    const spinner = ora('Loading agent details...').start();
    const content = await github.downloadAgent(repository.url, agent.path, repository.branch);
    const { metadata, body } = github.parseAgentMetadata(content);
    spinner.stop();

    console.log(chalk.white('\n📋 Metadata:'));
    if (metadata.name && metadata.name !== 'Unknown Agent') {
      console.log(chalk.gray(`  Name: ${metadata.name}`));
    }
    if (metadata.description && metadata.description !== 'Could not parse agent metadata') {
      // Truncate very long descriptions
      const desc = metadata.description.length > 200
        ? `${metadata.description.substring(0, 200)}...`
        : metadata.description;
      console.log(chalk.gray(`  Description: ${desc}`));
    }
    if (metadata.tools) {
      const tools = Array.isArray(metadata.tools) ? metadata.tools.join(', ') : metadata.tools;
      console.log(chalk.gray(`  Tools: ${tools}`));
    }
    if (metadata.model) {
      console.log(chalk.gray(`  Model: ${metadata.model}`));
    }
    if (metadata.color) {
      console.log(chalk.gray(`  Color: ${metadata.color}`));
    }

    // Show any other metadata fields that were parsed
    const commonFields = ['name', 'description', 'tools', 'model', 'color'];
    const otherFields = Object.keys(metadata).filter(key => !commonFields.includes(key));
    if (otherFields.length > 0) {
      otherFields.forEach(field => {
        console.log(chalk.gray(`  ${field}: ${metadata[field]}`));
      });
    }

    console.log(chalk.white('\n📝 System Prompt (first 300 characters):'));
    const preview = body.length > 300 ? `${body.substring(0, 300)}...` : body;
    console.log(chalk.gray(preview));

    console.log(chalk.white('\n📊 Stats:'));
    console.log(chalk.gray(`  Content length: ${content.length} characters`));
    console.log(chalk.gray(`  System prompt: ${body.length} characters`));

    // Show a warning if parsing had issues
    if (metadata.name === 'Unknown Agent' || metadata.description === 'Could not parse agent metadata') {
      console.log(chalk.yellow('\n⚠️  Note: There were issues parsing the YAML metadata for this agent.'));
      console.log(chalk.yellow('    The agent file may have formatting issues, but the content is still accessible.'));
    }

  } catch (error) {
    console.error(chalk.red(`\n❌ Failed to load agent details: ${error.message}`));
    console.log(chalk.yellow('\n💡 This might be due to:'));
    console.log(chalk.gray('   • Network connectivity issues'));
    console.log(chalk.gray('   • Agent file formatting problems'));
    console.log(chalk.gray('   • Repository access restrictions'));
    console.log(chalk.gray('   • Invalid file path'));
  }
}

async function handleInstallation(availableAgents, repository, options, prompts, installer, config) {
  // Installation type is already determined by CLI options
  // If --as-commands is used, installationType is 'commands'
  // Otherwise, it defaults to 'agents'
  // No need to prompt for installation type

  // Get installation location
  const targetPath = await prompts.selectInstallLocation(options.installationType);

  // Get selection method and agents
  const method = await prompts.selectInstallMethod();
  let selectedAgents = [];

  switch (method) {
  case 'all':
    selectedAgents = getAllAgents(availableAgents);
    break;

  case 'department': {
    const departments = await prompts.selectDepartments(availableAgents);
    selectedAgents = getAgentsByDepartments(availableAgents, departments);
    break;
  }

  case 'individual':
    selectedAgents = await prompts.selectIndividualAgents(availableAgents);
    break;

  case 'search': {
    const keyword = await prompts.getSearchKeyword();
    selectedAgents = await prompts.searchAgents(availableAgents, keyword);
    break;
  }
  }

  if (selectedAgents.length === 0) {
    console.log(chalk.yellow('No agents selected for installation.'));
    return;
  }

  // Show confirmation
  const summary = {
    count: selectedAgents.length,
    targetPath,
    repository: `${repository.name} (${repository.url})`,
    installationType: options.installationType,
    model: options.model,
    assignColors: options.assignColors
  };

  const confirmed = await prompts.confirmInstallation(summary);
  if (!confirmed) {
    console.log(chalk.yellow('Installation cancelled.'));
    return;
  }

  // Perform installation
  if (options.dryRun) {
    console.log(chalk.blue('\n🔍 Dry run - would install:'));
    selectedAgents.forEach(item => {
      console.log(chalk.white(`  - ${item.agent.name} (${item.department})`));
    });
    return;
  }

  const results = await installer.installAgents(selectedAgents, targetPath, repository, options);

  // Update config with installation metadata
  if (results.installed.length > 0) {
    const installationType = options.installationType === 'commands' ? 'installedCommands' : 'installedAgents';

    results.installed.forEach(item => {
      config[installationType].push({
        name: item.name,
        department: item.department,
        source: repository.url,
        installedAt: new Date().toISOString(),
        type: options.installationType
      });
    });

    await saveConfig(config);
  }
}

async function handleUpdate(installer, config) {
  const agentsPath = config.defaultInstallPath;
  await installer.updateAgents(agentsPath);
}

async function handleRemoval(installer, prompts, config) {
  const agentsPath = config.defaultInstallPath;

  // Sync config with filesystem first to clean up orphaned entries
  await installer.syncConfigWithFilesystem(agentsPath);

  const installedAgents = await installer.listInstalledAgents(agentsPath);

  if (installedAgents.length === 0) {
    console.log(chalk.yellow('No installed agents found.'));
    return;
  }

  const selectedForRemoval = await prompts.selectIndividualAgents({
    'installed': installedAgents
  });

  if (selectedForRemoval.length > 0) {
    await installer.removeAgents(selectedForRemoval, agentsPath);
  }
}

async function handleList(installer, config) {
  const agentsPath = config.defaultInstallPath;
  const installedAgents = await installer.listInstalledAgents(agentsPath);

  if (installedAgents.length === 0) {
    console.log(chalk.yellow('No installed agents found.'));
    return;
  }

  console.log(chalk.cyan(`\n📦 Installed Agents (${installedAgents.length}):`));

  const grouped = {};
  installedAgents.forEach(agent => {
    if (!grouped[agent.department]) {
      grouped[agent.department] = [];
    }
    grouped[agent.department].push(agent.name);
  });

  Object.keys(grouped).forEach(dept => {
    console.log(chalk.white(`\n  ${dept}:`));
    grouped[dept].forEach(name => {
      console.log(chalk.gray(`    - ${name}`));
    });
  });
}

async function handleConfiguration(config, prompts) {
  let configAction;
  do {
    configAction = await prompts.selectConfigurationAction();

    switch (configAction) {
    case 'repositories':
      await handleRepositoryManagement(config, prompts);
      break;

    case 'preferences':
      await handlePreferencesManagement(config, prompts);
      break;

    case 'view':
      await displayCurrentConfiguration(config);
      break;

    case 'reset': {
      const confirmed = await prompts.confirmReset();
      if (confirmed) {
        await resetConfiguration(config);
        console.log(chalk.green('✓ Configuration reset to defaults'));
      } else {
        console.log(chalk.yellow('Reset cancelled'));
      }
      break;
    }

    case 'back':
      break;

    default:
      console.log(chalk.yellow('Unknown configuration action'));
    }
  } while (configAction !== 'back');
}

async function handleRepositoryManagement(config, prompts) {
  let repoAction;
  do {
    repoAction = await prompts.selectRepositoryAction(config.repositories);

    switch (repoAction) {
    case 'add': {
      const newRepo = await prompts.addRepository();

      // Validate repository accessibility
      try {
        const github = new GitHubAPI();
        await github.fetchRepositoryStructure(newRepo.url, newRepo.branch);

        config.repositories.push({
          name: newRepo.name,
          url: newRepo.url,
          branch: newRepo.branch,
          description: newRepo.description,
          default: config.repositories.length === 0 // First repo becomes default
        });

        await saveConfig(config);
        console.log(chalk.green(`✓ Repository "${newRepo.name}" added successfully`));
      } catch (error) {
        console.error(chalk.red(`✗ Failed to access repository: ${error.message}`));
      }
      break;
    }

    case 'edit': {
      const repoIndex = await prompts.selectRepository(config.repositories, 'Select repository to edit:');
      if (repoIndex !== null) {
        const updatedRepo = await prompts.editRepository(config.repositories[repoIndex]);

        // Validate repository accessibility
        try {
          const github = new GitHubAPI();
          await github.fetchRepositoryStructure(updatedRepo.url, updatedRepo.branch);

          config.repositories[repoIndex] = {
            ...config.repositories[repoIndex],
            name: updatedRepo.name,
            url: updatedRepo.url,
            branch: updatedRepo.branch,
            description: updatedRepo.description
          };

          await saveConfig(config);
          console.log(chalk.green(`✓ Repository "${updatedRepo.name}" updated successfully`));
        } catch (error) {
          console.error(chalk.red(`✗ Failed to access repository: ${error.message}`));
        }
      }
      break;
    }

    case 'remove': {
      const repoIndex = await prompts.selectRepository(config.repositories, 'Select repository to remove:');
      if (repoIndex !== null) {
        const repository = config.repositories[repoIndex];
        const confirmed = await prompts.confirmRepositoryRemoval(repository);

        if (confirmed) {
          config.repositories.splice(repoIndex, 1);

          // If we removed the default repository, set a new default
          if (repository.default && config.repositories.length > 0) {
            config.repositories[0].default = true;
          }

          await saveConfig(config);
          console.log(chalk.green(`✓ Repository "${repository.name}" removed`));
        } else {
          console.log(chalk.yellow('Removal cancelled'));
        }
      }
      break;
    }

    case 'default': {
      const repoIndex = await prompts.selectRepository(config.repositories, 'Select default repository:');
      if (repoIndex !== null) {
        // Remove default flag from all repositories
        config.repositories.forEach(repo => { repo.default = false; });
        // Set new default
        config.repositories[repoIndex].default = true;

        await saveConfig(config);
        console.log(chalk.green(`✓ "${config.repositories[repoIndex].name}" set as default repository`));
      }
      break;
    }

    case 'list':
      displayRepositories(config.repositories);
      break;

    case 'back':
      break;

    default:
      console.log(chalk.yellow('Unknown repository action'));
    }
  } while (repoAction !== 'back');
}

async function handlePreferencesManagement(config, prompts) {
  console.log(chalk.cyan('\n⚙️  Configure Default Preferences'));

  const newPreferences = await prompts.selectPreferences(config.preferences);

  config.preferences = {
    ...config.preferences,
    ...newPreferences
  };

  await saveConfig(config);
  console.log(chalk.green('✓ Preferences updated successfully'));
}

function displayCurrentConfiguration(config) {
  console.log(chalk.cyan('\n📋 Current Configuration'));

  console.log(chalk.white('\n🔧 Preferences:'));
  console.log(chalk.gray(`  Default model: ${config.preferences.defaultModel}`));
  console.log(chalk.gray(`  Auto-assign colors: ${config.preferences.autoAssignColors}`));
  console.log(chalk.gray(`  Confirm before install: ${config.preferences.confirmBeforeInstall}`));
  console.log(chalk.gray(`  Show descriptions: ${config.preferences.showDescriptions}`));
  console.log(chalk.gray(`  Cache timeout: ${config.preferences.cacheTimeout}s`));

  displayRepositories(config.repositories);

  console.log(chalk.white('\n📈 Statistics:'));
  console.log(chalk.gray(`  Installed agents: ${config.installedAgents.length}`));
  console.log(chalk.gray(`  Installed commands: ${config.installedCommands.length}`));
  console.log(chalk.gray('  Configuration file: ~/.claude-wizard-config.json'));
}

function displayRepositories(repositories) {
  console.log(chalk.white('\n📦 Repositories:'));
  if (repositories.length === 0) {
    console.log(chalk.gray('  No repositories configured'));
  } else {
    repositories.forEach((repo, index) => {
      const defaultMarker = repo.default ? ' [DEFAULT]' : '';
      console.log(chalk.gray(`  ${index + 1}. ${repo.name}${defaultMarker}`));
      console.log(chalk.gray(`     ${repo.url} (${repo.branch})`));
      if (repo.description) {
        console.log(chalk.gray(`     ${repo.description}`));
      }
    });
  }
}

async function resetConfiguration(config) {
  const { loadConfig } = require('./utils.js');
  const defaultConfig = await loadConfig();

  // Keep only the default repository structure, clear everything else
  config.repositories = defaultConfig.repositories;
  config.installedAgents = [];
  config.installedCommands = [];
  config.preferences = defaultConfig.preferences;
  config.colorDistribution = defaultConfig.colorDistribution;

  await saveConfig(config);
}

// Helper functions
function getAllAgents(availableAgents) {
  const agents = [];
  Object.keys(availableAgents).forEach(dept => {
    availableAgents[dept].forEach(agent => {
      agents.push({ department: dept, agent });
    });
  });
  return agents;
}

function getAgentsByDepartments(availableAgents, departments) {
  const agents = [];
  departments.forEach(dept => {
    if (availableAgents[dept]) {
      availableAgents[dept].forEach(agent => {
        agents.push({ department: dept, agent });
      });
    }
  });
  return agents;
}

module.exports = { main };

