const { intro, outro, select, multiselect, text, confirm, spinner, isCancel, cancel } = require('@clack/prompts');
const picocolors = require('picocolors');
const os = require('os');
const path = require('path');
const fs = require('fs-extra');

class ClackPrompts {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the clack interface with intro
   */
  initializeInterface() {
    if (!this.initialized) {
      intro(picocolors.inverse(' 🤖 Claude Wizard '));
      this.initialized = true;
    }
  }

  /**
   * Handle cancellation of prompts
   */
  handleCancel() {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  /**
   * Check if result is cancelled and handle it
   */
  checkCancel(result) {
    if (isCancel(result)) {
      this.handleCancel();
    }
    return result;
  }

  async selectAction() {
    this.initializeInterface();

    const action = await select({
      message: 'What would you like to do?',
      options: [
        { value: 'browse', label: '🔍 Browse available agents', hint: 'Explore agents by department' },
        { value: 'install', label: '📦 Install agents', hint: 'Add agents to your system' },
        { value: 'bootstrap', label: '🏗️ Bootstrap new project', hint: 'Create project from templates' },
        { value: 'update', label: '🔄 Update agents', hint: 'Update existing agents' },
        { value: 'remove', label: '🗑️ Remove agents', hint: 'Uninstall agents' },
        { value: 'list', label: '📋 List installed agents', hint: 'Show what\'s installed' },
        { value: 'configure', label: '⚙️ Configure repositories', hint: 'Manage settings' }
      ]
    });

    return this.checkCancel(action);
  }

  async selectInstallLocation(installationType) {
    const agentsDir = installationType === 'agents' ? 'agents' : 'commands';
    const currentDir = process.cwd();

    const location = await select({
      message: 'Where to install?',
      options: [
        {
          value: path.join(currentDir, '.claude', agentsDir),
          label: `📁 Project (./.claude/${agentsDir})`,
          hint: 'Local to current project'
        },
        {
          value: path.join(os.homedir(), '.claude', agentsDir),
          label: `🏠 Global (~/.claude/${agentsDir})`,
          hint: 'Available system-wide'
        }
      ]
    });

    return this.checkCancel(location);
  }

  async selectInstallMethod() {
    const method = await select({
      message: 'Select installation method:',
      options: [
        { value: 'all', label: '📦 All agents', hint: 'Install everything' },
        { value: 'department', label: '🏢 By department', hint: 'Choose specific departments' },
        { value: 'individual', label: '🎯 Individual agents', hint: 'Pick specific agents' },
        { value: 'search', label: '🔍 Search agents', hint: 'Find agents by keywords' }
      ]
    });

    return this.checkCancel(method);
  }

  async selectDepartments(availableDepartments) {
    const options = Object.keys(availableDepartments).map(dept => ({
      value: dept,
      label: `${dept}`,
      hint: `${availableDepartments[dept].length} agents`
    }));

    const departments = await multiselect({
      message: 'Select departments: (Use space to select)',
      options,
      required: true
    });

    return this.checkCancel(departments);
  }

  async selectIndividualAgents(allAgents) {
    const options = [];

    Object.keys(allAgents).forEach(dept => {
      // Add separator for each department
      if (options.length > 0) {
        options.push({ value: `sep-${dept}`, label: '', hint: '─────────────────' });
      }

      // Add department header as disabled option
      options.push({
        value: `header-${dept}`,
        label: `${dept.toUpperCase()}`,
        hint: `${allAgents[dept].length} agents`,
        disabled: true
      });

      // Add agents for this department
      allAgents[dept].forEach(agent => {
        options.push({
          value: { department: dept, agent },
          label: `  ${agent.name}`,
          hint: agent.description?.substring(0, 50) + '...' || ''
        });
      });
    });

    const selectedAgents = await multiselect({
      message: 'Select individual agents: (Use space to select)',
      options: options.filter(opt => !(typeof opt.value === 'string' && opt.value.startsWith('sep-')) && !opt.disabled),
      required: true
    });

    return this.checkCancel(selectedAgents);
  }

  // Bootstrap-specific prompts
  async selectBootstrapAction() {
    const action = await select({
      message: 'What would you like to do?',
      options: [
        { value: 'list', label: '📋 List available templates', hint: 'Show all templates' },
        { value: 'create', label: '🏗️ Create new project', hint: 'Bootstrap from template' },
        { value: 'back', label: '🔙 Back to main menu', hint: 'Return to previous menu' }
      ]
    });

    return this.checkCancel(action);
  }

  async getProjectName() {
    const projectName = await text({
      message: 'Project name:',
      placeholder: 'my-awesome-project',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Project name is required';
        }
        // Check for valid directory name
        if (!/^[a-zA-Z0-9_-]+( [a-zA-Z0-9_-]+)*$/.test(input.trim())) {
          return 'Project name should only contain letters, numbers, spaces, hyphens, and underscores';
        }
        return undefined;
      }
    });

    const checkedName = this.checkCancel(projectName);
    return checkedName ? checkedName.trim() : '';
  }

  async getProjectDescription() {
    const description = await text({
      message: 'Project description (optional):',
      placeholder: 'A brief description of your project...'
    });

    const checkedResult = this.checkCancel(description);
    return (checkedResult && checkedResult.trim()) || null;
  }

  async getProjectPath(defaultPath) {
    const projectPath = await text({
      message: 'Project path:',
      initialValue: defaultPath,
      placeholder: defaultPath,
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'Project path is required';
        }
        return undefined;
      }
    });

    return this.checkCancel(projectPath);
  }

  async getPRDFile() {
    const wantsPRD = await confirm({
      message: 'Do you have a Product Requirement Document (PRD) to include?',
      initialValue: false
    });

    if (isCancel(wantsPRD) || !wantsPRD) {
      return null;
    }

    const prdInput = await text({
      message: 'PRD file path or URL:',
      placeholder: './requirements.md or https://example.com/requirements.md',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'PRD file path or URL is required';
        }

        const trimmedInput = input.trim();

        // Check if it's a URL
        if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
          try {
            new global.URL(trimmedInput);
            return undefined; // Valid URL
          } catch {
            return 'Invalid URL format';
          }
        }

        // Check if it's a local file path
        const resolvedPath = path.resolve(trimmedInput);
        if (!fs.existsSync(resolvedPath)) {
          return `File not found: ${resolvedPath}`;
        }

        const stats = fs.statSync(resolvedPath);
        if (!stats.isFile()) {
          return `Path is not a file: ${resolvedPath}`;
        }

        return undefined;
      }
    });

    if (isCancel(prdInput)) {
      return null;
    }

    const trimmedInput = prdInput.trim();

    if (trimmedInput.startsWith('http://') || trimmedInput.startsWith('https://')) {
      console.log(picocolors.green(`✓ PRD URL selected: ${trimmedInput}`));
      return { type: 'url', source: trimmedInput };
    } else {
      const resolvedPath = path.resolve(trimmedInput);
      console.log(picocolors.green(`✓ PRD file selected: ${path.basename(resolvedPath)}`));
      return { type: 'file', source: resolvedPath };
    }
  }

  async selectTemplate(availableTemplates) {
    const options = [];

    // Group templates by language
    Object.keys(availableTemplates).forEach(language => {
      // Add language separator
      if (options.length > 0) {
        options.push({ value: `sep-${language}`, label: '', disabled: true });
      }

      // Add language header
      options.push({
        value: `header-${language}`,
        label: `${language.toUpperCase()}`,
        hint: `${availableTemplates[language].length} templates`,
        disabled: true
      });

      // Add templates for this language
      availableTemplates[language].forEach(template => {
        options.push({
          value: template,
          label: `  ${template.name}`,
          hint: template.description?.substring(0, 60) + '...' || ''
        });
      });
    });

    // Add back option
    options.push({ value: 'sep-back', label: '', disabled: true });
    options.push({ value: 'back', label: '🔙 Back to previous menu', hint: 'Go back' });

    const selectedTemplate = await select({
      message: 'Choose a template:',
      options: options.filter(opt => !(typeof opt.value === 'string' && opt.value.startsWith('sep-')) && !opt.disabled)
    });

    return this.checkCancel(selectedTemplate);
  }

  async confirmBootstrap(projectInfo, template) {
    console.log('\n' + picocolors.cyan('📋 Bootstrap Summary:'));
    console.log(picocolors.white(`  Project Name: ${projectInfo.name}`));
    if (projectInfo.description) {
      console.log(picocolors.white(`  Description: ${projectInfo.description}`));
    }
    console.log(picocolors.white(`  Path: ${projectInfo.path}`));
    console.log(picocolors.white(`  Template: ${template.name} (${template.language})`));
    console.log(picocolors.white(`  Repository: ${template.repository.name}`));
    if (projectInfo.prdFile) {
      if (projectInfo.prdFile.type === 'url') {
        console.log(picocolors.white(`  PRD URL: ${projectInfo.prdFile.source}`));
      } else {
        console.log(picocolors.white(`  PRD File: ${path.basename(projectInfo.prdFile.source)}`));
        console.log(picocolors.gray(`    Full path: ${projectInfo.prdFile.source}`));
      }
    }
    console.log(picocolors.white(`  Generate Agents: ${projectInfo.generateAgents ? 'Yes' : 'No'}`));
    console.log('');

    const confirmed = await confirm({
      message: 'Continue with project creation?',
      initialValue: true
    });

    return this.checkCancel(confirmed);
  }

  async confirmGenerateAgents() {
    const confirmed = await confirm({
      message: 'Would you like to auto-generate project-specific agents? (recommended)',
      initialValue: true
    });

    return this.checkCancel(confirmed);
  }

  async selectBrowseAction(totalAgents, departmentCount) {
    const action = await select({
      message: `Browse ${totalAgents} agents across ${departmentCount} departments:`,
      options: [
        { value: 'department', label: '🏢 Browse by department', hint: 'Explore agents by category' },
        { value: 'all', label: '📋 Browse all agents', hint: 'View complete list' },
        { value: 'search', label: '🔍 Search agents', hint: 'Find by keywords' },
        { value: 'details', label: '📄 View agent details', hint: 'See detailed information' },
        { value: 'back', label: '🔙 Back to main menu', hint: 'Return to main menu' }
      ]
    });

    return this.checkCancel(action);
  }

  async selectDepartmentToBrowse(availableAgents) {
    const options = Object.keys(availableAgents).map(dept => ({
      value: dept,
      label: `${dept}`,
      hint: `${availableAgents[dept].length} agents`
    }));

    options.push({ value: 'back', label: '🔙 Back to browse menu' });

    const department = await select({
      message: 'Select department to browse:',
      options
    });

    return this.checkCancel(department);
  }

  async selectAgentForDetails(allAgents) {
    const options = [];

    Object.keys(allAgents).forEach(dept => {
      // Add department header as disabled option
      options.push({
        value: `header-${dept}`,
        label: `${dept.toUpperCase()}`,
        hint: `${allAgents[dept].length} agents`,
        disabled: true
      });

      // Add agents for this department
      allAgents[dept].forEach(agent => {
        options.push({
          value: { department: dept, agent },
          label: `  ${agent.name}`,
          hint: agent.description?.substring(0, 50) + '...' || ''
        });
      });
    });

    options.push({ value: 'back', label: '🔙 Back to browse menu' });

    const selected = await select({
      message: 'Select agent to view details:',
      options
    });

    return this.checkCancel(selected);
  }

  async getSearchKeyword() {
    const keyword = await text({
      message: 'Enter search keyword:',
      validate: (input) => input.trim() ? undefined : 'Keyword cannot be empty'
    });

    return this.checkCancel(keyword.trim());
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
      console.log(picocolors.yellow(`No agents found matching "${keyword}"`));
      return [];
    }

    const options = matchingAgents.map(item => ({
      value: item,
      label: `${item.agent.name}`,
      hint: `${item.department}`
    }));

    const selectedAgents = await multiselect({
      message: `Found ${matchingAgents.length} matching agents:`,
      options,
      required: true
    });

    return this.checkCancel(selectedAgents);
  }

  async selectAgentToView(agents, department = null) {
    const options = agents.map(agent => ({
      value: agent,
      label: agent.name,
      hint: agent.description?.substring(0, 50) + '...' || ''
    }));

    options.push({ value: 'back', label: '🔙 Back' });

    const title = department ? `${department} agents:` : 'Select agent to view:';

    const agent = await select({
      message: title,
      options
    });

    return this.checkCancel(agent);
  }

  async confirmOperation(message, defaultValue = true) {
    const confirmed = await confirm({
      message,
      initialValue: defaultValue
    });

    return this.checkCancel(confirmed);
  }

  async selectConfigurationAction() {
    const action = await select({
      message: 'Configuration options:',
      options: [
        { value: 'repositories', label: '📚 Manage repositories', hint: 'Add, edit, or remove repositories' },
        { value: 'preferences', label: '⚙️ Set default preferences', hint: 'Configure default settings' },
        { value: 'view', label: '👀 View current configuration', hint: 'Display current settings' },
        { value: 'reset', label: '🔄 Reset to defaults', hint: 'Restore default configuration' },
        { value: 'back', label: '🔙 Back to main menu', hint: 'Return to main menu' }
      ]
    });

    return this.checkCancel(action);
  }

  async selectRepositoryAction(_repositories) {
    const action = await select({
      message: 'Repository management:',
      options: [
        { value: 'add', label: '➕ Add new repository', hint: 'Add a new GitHub repository' },
        { value: 'edit', label: '✏️ Edit existing repository', hint: 'Modify repository settings' },
        { value: 'remove', label: '🗑️ Remove repository', hint: 'Delete a repository' },
        { value: 'default', label: '⭐ Set default repository', hint: 'Choose default repository' },
        { value: 'toggle', label: '🔄 Toggle repository status', hint: 'Enable/disable repositories' },
        { value: 'back', label: '🔙 Back', hint: 'Return to configuration menu' }
      ]
    });

    return this.checkCancel(action);
  }

  async selectRepository(repositories, message = 'Select repository:') {
    if (repositories.length === 0) {
      console.log(picocolors.yellow('No repositories configured.'));
      return null;
    }

    const options = repositories.map((repo, index) => ({
      value: index,
      label: `${repo.name} (${repo.url})${repo.default ? ' [DEFAULT]' : ''}`,
      hint: repo.description || ''
    }));

    const repoIndex = await select({
      message,
      options
    });

    return this.checkCancel(repoIndex);
  }

  async getRepositoryInfo() {
    const name = await text({
      message: 'Repository name:',
      placeholder: 'My Custom Repository',
      validate: value => value.trim() ? true : 'Repository name is required'
    });
    this.checkCancel(name);

    const url = await text({
      message: 'GitHub repository URL:',
      placeholder: 'https://github.com/username/repository',
      validate: value => {
        const trimmed = value.trim();
        if (!trimmed) return 'URL is required';
        if (!trimmed.includes('github.com')) return 'Must be a GitHub URL';
        try {
          new global.URL(trimmed);
          return true;
        } catch {
          return 'Invalid URL format';
        }
      }
    });
    this.checkCancel(url);

    const branch = await text({
      message: 'Branch name:',
      placeholder: 'main',
      initialValue: 'main',
      validate: value => value.trim() ? true : 'Branch name is required'
    });
    this.checkCancel(branch);

    const type = await select({
      message: 'Repository type:',
      options: [
        { value: 'agents', label: 'Agents Repository', hint: 'Contains Claude Code agents' },
        { value: 'templates', label: 'Templates Repository', hint: 'Contains project templates' },
        { value: 'mixed', label: 'Mixed Repository', hint: 'Contains both agents and templates' }
      ]
    });
    this.checkCancel(type);

    const description = await text({
      message: 'Description (optional):',
      placeholder: 'Repository description'
    });
    this.checkCancel(description);

    const isDefault = await confirm({
      message: 'Set as default repository?',
      initialValue: false
    });
    this.checkCancel(isDefault);

    return {
      name: name.trim(),
      url: url.trim(),
      branch: branch.trim(),
      type,
      description: description?.trim() || '',
      default: isDefault,
      enabled: true
    };
  }

  async confirmRepositoryRemoval(repositoryName) {
    const confirmed = await confirm({
      message: `Are you sure you want to remove "${repositoryName}"?`,
      initialValue: false
    });

    return this.checkCancel(confirmed);
  }

  async confirmConfigurationReset() {
    const confirmed = await confirm({
      message: 'Reset configuration to defaults? This will remove all custom repositories and settings.',
      initialValue: false
    });

    return this.checkCancel(confirmed);
  }

  async confirmInstallation(summary) {
    console.log(summary);

    const confirmed = await confirm({
      message: 'Proceed with installation?',
      initialValue: true
    });

    return this.checkCancel(confirmed);
  }

  async addRepository() {
    return await this.getRepositoryInfo();
  }

  async editRepository(repository) {
    const name = await text({
      message: 'Repository name:',
      placeholder: repository.name,
      initialValue: repository.name,
      validate: value => value.trim() ? true : 'Repository name is required'
    });
    this.checkCancel(name);

    const url = await text({
      message: 'GitHub repository URL:',
      placeholder: repository.url,
      initialValue: repository.url,
      validate: value => {
        const trimmed = value.trim();
        if (!trimmed) return 'URL is required';
        if (!trimmed.includes('github.com')) return 'Must be a GitHub URL';
        try {
          new global.URL(trimmed);
          return true;
        } catch {
          return 'Invalid URL format';
        }
      }
    });
    this.checkCancel(url);

    const branch = await text({
      message: 'Branch name:',
      placeholder: repository.branch,
      initialValue: repository.branch,
      validate: value => value.trim() ? true : 'Branch name is required'
    });
    this.checkCancel(branch);

    const type = await select({
      message: 'Repository type:',
      initialValue: repository.type,
      options: [
        { value: 'agents', label: 'Agents Repository', hint: 'Contains Claude Code agents' },
        { value: 'templates', label: 'Templates Repository', hint: 'Contains project templates' },
        { value: 'mixed', label: 'Mixed Repository', hint: 'Contains both agents and templates' }
      ]
    });
    this.checkCancel(type);

    const description = await text({
      message: 'Description (optional):',
      placeholder: repository.description,
      initialValue: repository.description || ''
    });
    this.checkCancel(description);

    const isDefault = await confirm({
      message: 'Set as default repository?',
      initialValue: repository.default || false
    });
    this.checkCancel(isDefault);

    return {
      name: name.trim(),
      url: url.trim(),
      branch: branch.trim(),
      type,
      description: description?.trim() || '',
      default: isDefault,
      enabled: repository.enabled !== undefined ? repository.enabled : true
    };
  }

  async selectPreferences(currentPreferences) {
    const showDescriptions = await confirm({
      message: 'Show agent descriptions in lists?',
      initialValue: currentPreferences.showDescriptions
    });
    this.checkCancel(showDescriptions);

    const confirmBeforeInstall = await confirm({
      message: 'Ask for confirmation before installing agents?',
      initialValue: currentPreferences.confirmBeforeInstall
    });
    this.checkCancel(confirmBeforeInstall);

    const confirmBeforeBootstrap = await confirm({
      message: 'Ask for confirmation before bootstrapping projects?',
      initialValue: currentPreferences.confirmBeforeBootstrap
    });
    this.checkCancel(confirmBeforeBootstrap);

    const autoInstallDependencies = await confirm({
      message: 'Automatically install project dependencies during bootstrap?',
      initialValue: currentPreferences.autoInstallDependencies
    });
    this.checkCancel(autoInstallDependencies);

    const autoInitGit = await confirm({
      message: 'Automatically initialize git repository during bootstrap?',
      initialValue: currentPreferences.autoInitGit
    });
    this.checkCancel(autoInitGit);

    const defaultModel = await select({
      message: 'Default Claude model for new agents:',
      initialValue: currentPreferences.defaultModel,
      options: [
        { value: 'inherit', label: 'Inherit (use agent\'s default)', hint: 'Keep original model setting' },
        { value: 'opus', label: 'Claude Opus', hint: 'Use Opus model' },
        { value: 'sonnet', label: 'Claude Sonnet', hint: 'Use Sonnet model' },
        { value: 'none', label: 'No model specified', hint: 'Let Claude Code decide' }
      ]
    });
    this.checkCancel(defaultModel);

    const autoAssignColors = await confirm({
      message: 'Automatically assign colors to agents without colors?',
      initialValue: currentPreferences.autoAssignColors
    });
    this.checkCancel(autoAssignColors);

    return {
      showDescriptions,
      confirmBeforeInstall,
      confirmBeforeBootstrap,
      autoInstallDependencies,
      autoInitGit,
      defaultModel,
      autoAssignColors
    };
  }

  async confirmReset() {
    const confirmed = await confirm({
      message: 'Reset all configuration to defaults? This cannot be undone.',
      initialValue: false
    });

    return this.checkCancel(confirmed);
  }

  async confirmContinueBrowsing() {
    const confirmed = await confirm({
      message: 'Continue browsing agents?',
      initialValue: true
    });

    return this.checkCancel(confirmed);
  }

  /**
   * Create a spinner for long-running operations
   */
  createSpinner() {
    return spinner();
  }

  /**
   * Close the interface with outro
   */
  closeInterface(message = 'Operation completed!') {
    outro(picocolors.green(message));
  }
}

module.exports = { ClackPrompts };
