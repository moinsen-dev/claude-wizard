const chalk = require('chalk');
const path = require('path');
const { TemplateRepository } = require('./template-repository');
const { RepositoryManager } = require('./repository-manager');
const { TemplateBootstrapper } = require('./template-bootstrapper');
const { loadConfig } = require('./utils');
const { warningManager } = require('./warning-manager');
const { UIUtils } = require('./ui-utils');

async function bootstrap(options = {}) {
  console.log(chalk.blue.bold('\n🏗️ Claude Wizard - Project Bootstrap\n'));

  try {
    // Load configuration
    const config = await loadConfig();
    const repoManager = new RepositoryManager(config.repositories);
    const templateRepo = new TemplateRepository();
    const { ClackPrompts } = require('./prompts-clack');
    const prompts = new ClackPrompts();

    // Handle --list-templates option
    if (options.listTemplates) {
      await listAllTemplates(repoManager, templateRepo);
      return;
    }

    // Fetch templates from configured repositories
    const { spinner } = require('@clack/prompts');
    const s = spinner();
    s.start('Fetching available templates...');
    let availableTemplates;
    try {
      const templateRepositories = repoManager.getByType('templates');

      if (templateRepositories.length === 0) {
        s.stop('No template repositories configured');
        console.log(chalk.yellow('\nTo add template repositories, run:'));
        console.log(chalk.white('  claude-wizard configure'));
        return;
      }

      availableTemplates = await templateRepo.discoverTemplates(templateRepositories);
      const totalTemplates = Object.values(availableTemplates)
        .reduce((sum, templates) => sum + templates.length, 0);

      s.stop(`Found ${totalTemplates} templates across ${Object.keys(availableTemplates).length} languages`);

      // Display any warnings collected during template discovery
      warningManager.displayWarnings();
    } catch (error) {
      s.stop('Failed to fetch templates');
      throw error;
    }

    if (Object.keys(availableTemplates).length === 0) {
      console.log(chalk.yellow('No templates found in configured repositories.'));
      return;
    }

    // Direct template specification via CLI options
    if (options.template) {
      await handleDirectBootstrap(availableTemplates, options);
      return;
    }

    // Interactive mode (default behavior)
    await handleInteractiveBootstrap(availableTemplates, options, prompts, repoManager, templateRepo);

  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.error(chalk.red('Network error: Please check your internet connection'));
    } else {
      console.error(chalk.red('Bootstrap Error:'), error.message);
      if (options.verbose) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  }
}

async function listAllTemplates(repoManager, templateRepo) {
  try {
    const templateRepositories = repoManager.getByType('templates');

    if (templateRepositories.length === 0) {
      console.log(UIUtils.formatWarning('No template repositories configured.'));
      return;
    }

    const availableTemplates = await templateRepo.discoverTemplates(templateRepositories);

    // Display any warnings from template discovery
    warningManager.displayWarnings();

    if (Object.keys(availableTemplates).length === 0) {
      console.log(UIUtils.formatWarning('No templates found in configured repositories.'));
      return;
    }

    // Use the new formatted display
    console.log(UIUtils.formatTemplatesList(availableTemplates));

  } catch (error) {
    console.error(UIUtils.formatError(`Failed to list templates: ${error.message}`));
  }
}

async function handleDirectBootstrap(availableTemplates, options) {
  // Find template by name (case-insensitive search)
  const templateName = options.template.toLowerCase();
  let selectedTemplate = null;

  for (const [language, templates] of Object.entries(availableTemplates)) {
    const found = templates.find(t =>
      t.name.toLowerCase().includes(templateName) ||
      t.id.toLowerCase().includes(templateName) ||
      language.toLowerCase() === templateName
    );
    if (found) {
      selectedTemplate = found;
      break;
    }
  }

  if (!selectedTemplate) {
    console.error(chalk.red(`Template "${options.template}" not found.`));
    console.log(chalk.yellow('\nAvailable templates:'));
    Object.entries(availableTemplates).forEach(([language, templates]) => {
      templates.forEach(template => {
        console.log(chalk.gray(`  ${template.name} (${language})`));
      });
    });
    return;
  }

  // Prepare project info for Claude bootstrap
  const projectName = options.name || await promptProjectName(selectedTemplate);
  const projectPath = options.path || path.join(process.cwd(), projectName.replace(/\s+/g, '-').toLowerCase());

  const projectInfo = {
    name: projectName,
    description: `A new ${selectedTemplate.language} project based on ${selectedTemplate.name}`,
    path: projectPath,
    prdFile: options.prd || null
  };

  const bootstrapOptions = {
    dryRun: options.dryRun || false,
    verbose: options.verbose || false
  };

  // Execute bootstrap with Claude
  await executeBootstrapWithClaude(selectedTemplate, projectInfo, bootstrapOptions);
}

async function handleInteractiveBootstrap(availableTemplates, options, prompts, repoManager, templateRepo) {
  // Initialize the clack interface if using ClackPrompts
  if (prompts.initializeInterface) {
    prompts.initializeInterface();
  }
  let action = '';

  do {
    action = await prompts.selectBootstrapAction();

    switch (action) {
    case 'list':
      await listAllTemplates(repoManager, templateRepo);
      break;

    case 'create': {
      const result = await handleInteractiveProjectCreation(availableTemplates, options, prompts);
      if (result && result.success) {
        // Project created successfully, exit the loop
        return;
      } else if (result && result.cancelled) {
        // User cancelled template selection, continue the loop to show bootstrap menu
        break;
      }
      // If result is undefined or success is false, also exit to prevent loop
      return;
    }

    case 'back':
      return;

    default:
      console.log(chalk.yellow('Unknown action'));
    }
  } while (action !== 'back');
}

async function handleInteractiveProjectCreation(availableTemplates, options, prompts) {
  try {
    // Collect project information
    const projectName = await prompts.getProjectName();
    const projectDescription = await prompts.getProjectDescription();

    // Generate default path
    const defaultPath = path.join(process.cwd(), projectName.replace(/\s+/g, '-').toLowerCase());
    const projectPath = await prompts.getProjectPath(defaultPath);

    // Select template
    const selectedTemplate = await prompts.selectTemplate(availableTemplates);
    if (selectedTemplate === 'back') {
      return { success: false, cancelled: true };
    }

    // Ask for PRD file (optional)
    const prdFile = await prompts.getPRDFile();

    // Ask about auto-generating agents
    const generateAgents = await prompts.confirmGenerateAgents();

    // Prepare project info
    const projectInfo = {
      name: projectName,
      description: projectDescription,
      path: projectPath,
      prdFile: prdFile,
      generateAgents: generateAgents
    };

    // Confirm bootstrap
    const confirmed = await prompts.confirmBootstrap(projectInfo, selectedTemplate);
    if (!confirmed) {
      console.log(chalk.yellow('\n⏸️ Bootstrap cancelled by user'));
      return;
    }

    // Execute bootstrap
    await executeBootstrapWithClaude(selectedTemplate, projectInfo, options);

  } catch (error) {
    console.error(chalk.red('\n❌ Bootstrap failed:'), error.message);
  }
}

async function executeBootstrapWithClaude(template, projectInfo, options = {}) {
  const bootstrapper = new TemplateBootstrapper();
  const { name, description, path: projectPath, prdFile, generateAgents } = projectInfo;

  console.log(chalk.cyan(`\n🚀 Creating ${template.language} project: ${name}\n`));

  try {
    // 1. Validate and create directory
    if (options.verbose) {
      console.log(chalk.cyan(`[BOOTSTRAP] Project path: ${projectPath}`));
    }

    // Check if directory already exists
    if (await require('fs-extra').pathExists(projectPath)) {
      const files = await require('fs-extra').readdir(projectPath);
      if (files.length > 0) {
        throw new Error(`Directory ${projectPath} already exists and is not empty`);
      }
      if (options.verbose) {
        console.log(chalk.yellow('[BOOTSTRAP] Directory exists but is empty, proceeding...'));
      }
    }

    console.log(chalk.white('📁 Creating project directory...'));
    if (options.verbose) {
      console.log(chalk.cyan(`[FS] Creating directory: ${projectPath}`));
    }

    await require('fs-extra').ensureDir(projectPath);

    if (options.verbose) {
      console.log(chalk.green('[FS] ✔ Directory created successfully'));
    }

    // Initialize git repository
    console.log(chalk.white('🔧 Initializing git repository...'));
    await bootstrapper.initializeGit(projectPath, options.verbose);

    // 2. Use Claude Code CLI for bootstrap (if available)
    const claudeAvailable = await bootstrapper.isClaudeCliAvailable();

    if (claudeAvailable && !options.skipClaude) {
      console.log(chalk.cyan('\n🤖 Using Claude Code for intelligent project bootstrap...\n'));

      const claudeResult = await bootstrapper.bootstrapWithClaude(
        template,
        name,
        projectPath,
        description,
        {
          verbose: options.verbose,
          prdFile: prdFile,
          generateAgents: generateAgents
        }
      );

      if (claudeResult.success) {
        console.log(chalk.green('\n✅ Bootstrap script created successfully!'));

        // Show the script location and instructions
        if (claudeResult.scriptPath) {
          console.log(chalk.cyan('\n📄 Script location:'), claudeResult.scriptPath);
        }

        console.log(chalk.cyan('\n🏁 To complete the bootstrap:'));
        if (claudeResult.instructions) {
          claudeResult.instructions.forEach((step, index) => {
            console.log(chalk.white(`  ${index + 1}. ${step}`));
          });
        }

        console.log(chalk.gray('\n💡 The script will use Claude Code to generate your project files with proper environment sourcing.'));
        console.log(chalk.yellow('\n⚠️  Note: You need to run the script manually to complete the bootstrap process.'));

        return { success: true };
      } else {
        console.log(chalk.yellow('\n⚠️ Bootstrap script generation failed, falling back to manual template processing...'));
        console.log(chalk.gray(`Error: ${claudeResult.error || 'Unknown error'}`));
      }
    } else {
      if (!claudeAvailable) {
        console.log(chalk.yellow('\n⚠️ Claude Code CLI not available, using manual template processing...'));
      }
    }

    // 3. Fallback: Use manual template processing
    console.log(chalk.white('\n📄 Processing template files...'));
    await executeBootstrap({
      template,
      name,
      path: projectPath,
      description,
      dryRun: options.dryRun,
      verbose: options.verbose,
      prdFile: prdFile
    });

    return { success: true };

  } catch (error) {
    console.error(chalk.red(`\n❌ Bootstrap failed: ${error.message}`));

    if (options.verbose) {
      console.error(error.stack);
    }

    return { success: false };
  }
}

async function executeBootstrap(projectConfig) {
  const { template, name, path, dryRun, verbose, prdFile } = projectConfig;
  const bootstrapper = new TemplateBootstrapper();

  console.log(chalk.cyan(`\n🚀 Bootstrapping ${template.name}\n`));

  if (verbose) {
    console.log(chalk.white('Configuration:'));
    console.log(chalk.gray(`  Template: ${template.name}`));
    console.log(chalk.gray(`  Language: ${template.language}`));
    console.log(chalk.gray(`  Project: ${name}`));
    console.log(chalk.gray(`  Location: ${path}`));
    console.log(chalk.gray(`  Repository: ${template.repository.name}`));
    console.log('');
  }

  try {
    // Execute bootstrap
    const result = await bootstrapper.initializeProject(template, name, path, {
      dryRun,
      verbose,
      autoInstall: true,
      initGit: true,
      prdFile
    });

    if (result.success) {
      console.log(chalk.green('✅ Bootstrap completed successfully!\n'));

      // Show steps taken
      if (verbose || dryRun) {
        console.log(chalk.white('Steps completed:'));
        result.steps.forEach(step => {
          console.log(chalk.gray(`  ${step}`));
        });
        console.log('');
      }

      if (!dryRun) {
        // Show next steps
        console.log(chalk.white('🎯 Next steps:'));
        const nextSteps = bootstrapper.getNextSteps(template, name, result.projectPath);
        nextSteps.forEach(step => {
          console.log(chalk.gray(`  ${step}`));
        });
        console.log('');

        // Show project info
        console.log(chalk.white('📁 Project created at:'));
        console.log(chalk.gray(`  ${result.projectPath}`));

        if (template.metadata.features && template.metadata.features.length > 0) {
          console.log(chalk.white('✨ Template features:'));
          template.metadata.features.slice(0, 5).forEach(feature => {
            console.log(chalk.gray(`  • ${feature}`));
          });
        }
      }

    } else {
      console.log(chalk.red('❌ Bootstrap failed!\n'));
      console.log(chalk.white('Errors:'));
      result.errors.forEach(error => {
        console.log(chalk.red(`  • ${error}`));
      });
    }

  } catch (error) {
    console.log(chalk.red('❌ Bootstrap failed with error:'));
    console.log(chalk.red(`  ${error.message}`));
    if (verbose) {
      console.log(chalk.gray(error.stack));
    }
  }
}

async function promptProjectName(template) {
  const defaultName = `my-${template.language.toLowerCase()}-project`;

  // For now, just return the default name
  // TODO: Implement actual prompting
  return defaultName;
}

module.exports = { bootstrap };
