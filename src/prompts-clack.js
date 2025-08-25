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

    const prdPath = await text({
      message: 'Path to PRD file:',
      placeholder: './requirements.md',
      validate: (input) => {
        if (!input || input.trim().length === 0) {
          return 'PRD file path is required';
        }

        const resolvedPath = path.resolve(input.trim());

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

    if (isCancel(prdPath)) {
      return null;
    }

    const resolvedPath = path.resolve(prdPath.trim());
    console.log(picocolors.green(`✓ PRD file selected: ${path.basename(resolvedPath)}`));
    return resolvedPath;
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
      console.log(picocolors.white(`  PRD File: ${path.basename(projectInfo.prdFile)}`));
      console.log(picocolors.gray(`    Full path: ${projectInfo.prdFile}`));
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
