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
