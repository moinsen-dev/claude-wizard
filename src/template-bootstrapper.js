const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const chalk = require('chalk');
const ora = require('ora');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class TemplateBootstrapper {
  constructor() {
    // Variables that can be used in templates
    this.defaultVariables = {
      year: new Date().getFullYear(),
      date: new Date().toISOString().split('T')[0],
      author: os.userInfo().username,
      email: `${os.userInfo().username}@example.com`
    };
  }

  /**
   * Initialize a new project from template
   * @param {Object} template - Template metadata
   * @param {string} projectName - Name of the project to create
   * @param {string} projectPath - Path where to create the project
   * @param {Object} options - Bootstrapping options
   * @returns {Object} Bootstrap result
   */
  async initializeProject(template, projectName, projectPath, options = {}) {
    const {
      dryRun = false,
      verbose = false,
      autoInstall = true,
      initGit = true,
      prdFile = null
    } = options;

    const result = {
      success: false,
      projectPath: null,
      steps: [],
      errors: []
    };

    try {
      const fullProjectPath = path.resolve(projectPath, projectName);
      result.projectPath = fullProjectPath;

      // Step 1: Validate project path
      const validation = await this.validateProjectPath(fullProjectPath);
      if (!validation.isValid) {
        result.errors.push(...validation.errors);
        return result;
      }
      result.steps.push('✓ Validated project path');

      if (dryRun) {
        result.steps.push('🔍 Dry run mode - would create project structure');
        result.success = true;
        return result;
      }

      // Step 2: Create project directory
      await fs.ensureDir(fullProjectPath);
      result.steps.push(`✓ Created project directory: ${projectName}`);

      // Step 3: Prepare template variables
      const variables = this.prepareVariables(
        template,
        projectName,
        options.variables || {}
      );
      result.steps.push('✓ Prepared template variables');

      // Step 4: Download and process template files
      const downloadResult = await this.downloadAndProcessTemplateFiles(
        template,
        fullProjectPath,
        variables,
        verbose
      );
      result.steps.push(
        `✓ Downloaded and processed ${downloadResult.fileCount} template files`
      );

      // Step 5: Execute setup commands
      if (
        template.metadata.setupCommands &&
        template.metadata.setupCommands.length > 0
      ) {
        const setupResult = await this.executeSetupCommands(
          template.metadata.setupCommands,
          fullProjectPath,
          verbose
        );
        result.steps.push(
          `✓ Executed ${setupResult.commandCount} setup commands`
        );
      }

      // Step 6: Install dependencies
      if (
        autoInstall &&
        template.metadata.dependencies &&
        template.metadata.dependencies.length > 0
      ) {
        const installResult = await this.installDependencies(
          template,
          fullProjectPath,
          verbose
        );
        result.steps.push(
          `✓ Installed dependencies: ${installResult.packageManager}`
        );
      }

      // Step 7: Copy PRD file if provided
      if (prdFile) {
        await this.copyPRDFile(prdFile, fullProjectPath, verbose);
        result.steps.push(`✓ Copied PRD file: ${path.basename(prdFile)}`);
      }

      // Step 8: Initialize Git repository
      if (initGit) {
        await this.initializeGitRepository(fullProjectPath, verbose);
        result.steps.push('✓ Initialized Git repository');
      }

      result.success = true;
      return result;
    } catch (error) {
      result.errors.push(error.message);
      return result;
    }
  }

  /**
   * Validate project path and check for conflicts
   * @param {string} projectPath - Full path to the project directory
   * @returns {Object} Validation result
   */
  async validateProjectPath(projectPath) {
    const errors = [];

    // Check if path already exists
    if (await fs.pathExists(projectPath)) {
      const files = await fs.readdir(projectPath);
      if (files.length > 0) {
        errors.push('Directory already exists and is not empty');
      }
    }

    // Check if parent directory is writable
    const parentDir = path.dirname(projectPath);
    try {
      await fs.access(parentDir, fs.constants.W_OK);
    } catch {
      errors.push('Parent directory is not writable');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Prepare template variables for substitution
   * @param {Object} template - Template metadata
   * @param {string} projectName - Project name
   * @param {Object} customVariables - Custom variables from user
   * @returns {Object} All variables for substitution
   */
  prepareVariables(template, projectName, customVariables = {}) {
    const kebabCase = projectName.toLowerCase().replace(/\s+/g, '-');
    const snakeCase = projectName.toLowerCase().replace(/\s+/g, '_');
    const pascalCase = projectName
      .replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
      .replace(/\s+/g, '');
    const camelCase = pascalCase.charAt(0).toLowerCase() + pascalCase.slice(1);

    return {
      ...this.defaultVariables,
      'project-name': projectName,
      project_name: snakeCase,
      projectName: camelCase,
      ProjectName: pascalCase,
      'project-name-kebab': kebabCase,
      language: template.language.toLowerCase(),
      Language: template.language,
      template: template.name,
      description: `A ${template.language} project created with ${template.name}`,
      ...customVariables
    };
  }

  /**
   * Download template files and process variable substitution
   * @param {Object} template - Template metadata
   * @param {string} projectPath - Project directory path
   * @param {Object} variables - Variables for substitution
   * @param {boolean} verbose - Show detailed output
   * @returns {Object} Download result
   */
  async downloadAndProcessTemplateFiles(
    template,
    projectPath,
    variables,
    verbose = false
  ) {
    const { TemplateRepository } = require('./template-repository');
    const templateRepo = new TemplateRepository();

    // Get list of template files
    const templateFiles = await templateRepo.getTemplateFiles(template);
    let fileCount = 0;

    const spinner = verbose
      ? null
      : ora('Downloading template files...').start();

    try {
      for (const file of templateFiles) {
        if (verbose) {
          console.log(chalk.gray(`  Downloading: ${file.path}`));
        }

        // Download file content
        const content = await templateRepo.downloadTemplateFile(
          template,
          file.path
        );

        // Process variable substitution in content
        const processedContent = this.processVariableSubstitution(
          content,
          variables
        );

        // Process variable substitution in file path
        const relativePath = file.path.replace(`${template.path}/`, '');
        const processedPath = this.processVariableSubstitution(
          relativePath,
          variables
        );

        // Ensure target directory exists
        const targetPath = path.join(projectPath, processedPath);
        await fs.ensureDir(path.dirname(targetPath));

        // Write processed file
        await fs.writeFile(targetPath, processedContent);
        fileCount++;
      }

      if (spinner) {
        spinner.succeed(`Downloaded ${fileCount} template files`);
      }
    } catch (error) {
      if (spinner) {
        spinner.fail('Failed to download template files');
      }
      throw error;
    }

    return { fileCount };
  }

  /**
   * Process variable substitution in text content
   * @param {string} content - Text content to process
   * @param {Object} variables - Variables to substitute
   * @returns {string} Processed content
   */
  processVariableSubstitution(content, variables) {
    let processed = content;

    // Replace {{variable}} patterns
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      processed = processed.replace(regex, value);
    });

    return processed;
  }

  /**
   * Execute setup commands from template
   * @param {Array} commands - Array of setup commands
   * @param {string} projectPath - Project directory path
   * @param {boolean} verbose - Show detailed output
   * @returns {Object} Execution result
   */
  async executeSetupCommands(commands, projectPath, verbose = false) {
    let commandCount = 0;

    const spinner = verbose ? null : ora('Executing setup commands...').start();

    try {
      for (const command of commands) {
        if (verbose) {
          console.log(chalk.gray(`  Running: ${command}`));
        }

        await this.executeCommand(command, projectPath);
        commandCount++;
      }

      if (spinner) {
        spinner.succeed(`Executed ${commandCount} setup commands`);
      }
    } catch (error) {
      if (spinner) {
        spinner.fail('Failed to execute setup commands');
      }
      throw error;
    }

    return { commandCount };
  }

  /**
   * Execute a single command in the project directory
   * @param {string} command - Command to execute
   * @param {string} projectPath - Working directory
   * @returns {Promise} Command execution promise
   */
  executeCommand(command, projectPath) {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');

      // Parse command and arguments
      const parts = command.split(' ');
      const cmd = parts[0];
      const args = parts.slice(1);

      const child = spawn(cmd, args, {
        cwd: projectPath,
        stdio: 'pipe',
        shell: true
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with exit code ${code}: ${stderr}`));
        }
      });
    });
  }

  /**
   * Install dependencies based on template configuration
   * @param {Object} template - Template metadata
   * @param {string} projectPath - Project directory path
   * @param {boolean} verbose - Show detailed output
   * @returns {Object} Installation result
   */
  async installDependencies(template, projectPath, verbose = false) {
    const packageManager = this.detectPackageManager(template, projectPath);

    const spinner = verbose
      ? null
      : ora(`Installing dependencies with ${packageManager}...`).start();

    try {
      const installCommand = this.getInstallCommand(packageManager);

      if (verbose) {
        console.log(
          chalk.cyan(
            `[${packageManager.toUpperCase()}] Executing command: ${installCommand}`
          )
        );
        console.log(
          chalk.cyan(
            `[${packageManager.toUpperCase()}] Working directory: ${projectPath}`
          )
        );
      }

      await this.executeCommand(installCommand, projectPath);

      if (spinner) {
        spinner.succeed(`Dependencies installed with ${packageManager}`);
      } else if (verbose) {
        console.log(
          chalk.green(
            `[${packageManager.toUpperCase()}] ✔ Dependencies installed successfully`
          )
        );
      }
    } catch (error) {
      if (spinner) {
        spinner.fail('Failed to install dependencies');
      } else if (verbose) {
        console.log(
          chalk.red(
            `[${packageManager.toUpperCase()}] ✖ Failed to install dependencies:`,
            error.message
          )
        );
      }
      throw error;
    }

    return { packageManager };
  }

  /**
   * Detect appropriate package manager for the template
   * @param {Object} template - Template metadata
   * @param {string} projectPath - Project directory path
   * @returns {string} Package manager name
   */
  detectPackageManager(template, projectPath) {
    const language = template.language.toLowerCase();

    // Language-specific package managers
    switch (language) {
    case 'python':
      if (fs.existsSync(path.join(projectPath, 'pyproject.toml'))) {
        return 'uv'; // Prefer uv for modern Python projects
      }
      return 'pip';

    case 'javascript':
    case 'typescript':
      if (fs.existsSync(path.join(projectPath, 'yarn.lock'))) {
        return 'yarn';
      }
      return 'npm';

    case 'rust':
      return 'cargo';

    case 'go':
      return 'go';

    case 'java':
      if (fs.existsSync(path.join(projectPath, 'pom.xml'))) {
        return 'mvn';
      }
      return 'gradle';

    default:
      return 'npm'; // Default fallback
    }
  }

  /**
   * Get installation command for package manager
   * @param {string} packageManager - Package manager name
   * @returns {string} Installation command
   */
  getInstallCommand(packageManager) {
    const commands = {
      npm: 'npm install',
      yarn: 'yarn install',
      pip: 'pip install -r requirements.txt',
      uv: 'uv sync',
      cargo: 'cargo build',
      go: 'go mod tidy',
      mvn: 'mvn install',
      gradle: './gradlew build'
    };

    return commands[packageManager] || 'npm install';
  }

  /**
   * Initialize Git repository in project directory
   * @param {string} projectPath - Project directory path
   * @param {boolean} verbose - Show detailed output
   */
  async initializeGitRepository(projectPath, verbose = false) {
    const spinner = verbose
      ? null
      : ora('Initializing Git repository...').start();

    try {
      if (verbose) {
        console.log(chalk.cyan('[GIT] Executing command: git init'));
        console.log(chalk.cyan(`[GIT] Working directory: ${projectPath}`));
      }
      await this.executeCommand('git init', projectPath);

      if (verbose) {
        console.log(chalk.cyan('[GIT] Executing command: git add .'));
      }
      await this.executeCommand('git add .', projectPath);

      if (verbose) {
        console.log(
          chalk.cyan(
            '[GIT] Executing command: git commit -m "Initial commit from template"'
          )
        );
      }
      await this.executeCommand(
        'git commit -m "Initial commit from template"',
        projectPath
      );

      if (spinner) {
        spinner.succeed('Git repository initialized');
      } else if (verbose) {
        console.log(
          chalk.green('[GIT] ✔ Git repository initialized with initial commit')
        );
      }
    } catch (error) {
      if (spinner) {
        spinner.warn('Failed to initialize Git repository');
      }
      // Don't throw error for Git initialization failure
      if (verbose) {
        console.log(
          chalk.yellow('[GIT] ⚠ Git initialization failed:', error.message)
        );
      }
    }
  }

  /**
   * Copy Product Requirement Document (PRD) file to project directory
   * @param {string} prdFilePath - Path to the PRD file
   * @param {string} projectPath - Project directory path
   * @param {boolean} verbose - Show detailed output
   */
  async copyPRDFile(prdFilePath, projectPath, verbose = false) {
    const spinner = verbose ? null : ora('Copying PRD file...').start();

    try {
      // Validate PRD file exists
      if (!(await fs.pathExists(prdFilePath))) {
        throw new Error(`PRD file not found: ${prdFilePath}`);
      }

      // Get file stats to check if it's a file
      const stats = await fs.stat(prdFilePath);
      if (!stats.isFile()) {
        throw new Error(`PRD path is not a file: ${prdFilePath}`);
      }

      // Extract filename and create destination path
      const fileName = path.basename(prdFilePath);
      const destinationPath = path.join(projectPath, fileName);

      if (verbose) {
        console.log(chalk.cyan(`[PRD] Copying file: ${prdFilePath}`));
        console.log(chalk.cyan(`[PRD] Destination: ${destinationPath}`));
      }

      // Copy the PRD file
      await fs.copy(prdFilePath, destinationPath);

      if (spinner) {
        spinner.succeed(`PRD file copied: ${fileName}`);
      } else if (verbose) {
        console.log(chalk.green(`[PRD] ✔ PRD file copied successfully: ${fileName}`));
      }
    } catch (error) {
      if (spinner) {
        spinner.fail('Failed to copy PRD file');
      }
      throw new Error(`PRD copy failed: ${error.message}`);
    }
  }

  /**
   * Get next steps for the user after bootstrap
   * @param {Object} template - Template metadata
   * @param {string} projectName - Project name
   * @param {string} projectPath - Project directory path
   * @returns {Array} Array of next steps
   */
  getNextSteps(template, projectName) {
    const steps = [`cd ${projectName}`];

    // Language-specific next steps
    const language = template.language.toLowerCase();
    switch (language) {
    case 'python':
      steps.push('python -m venv .venv');
      steps.push(
        'source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate'
      );
      steps.push('pip install -r requirements.txt');
      break;

    case 'javascript':
    case 'typescript':
      steps.push('npm start');
      break;

    case 'rust':
      steps.push('cargo run');
      break;

    case 'go':
      steps.push('go run main.go');
      break;
    }

    steps.push(`code ${projectName}  # Open in VS Code`);

    return steps;
  }

  /**
   * Check if Claude CLI is available
   * @returns {boolean} True if Claude CLI is installed
   */
  async isClaudeCliAvailable() {
    try {
      await execAsync('claude --version');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Bootstrap project using Claude Code CLI
   * @param {Object} template - Template metadata with URL
   * @param {string} projectName - Project name
   * @param {string} projectPath - Full path to project directory
   * @param {string} description - Project description
   * @param {Object} options - Bootstrap options
   * @returns {Object} Claude response and results
   */
  async bootstrapWithClaude(
    template,
    projectName,
    projectPath,
    description = null,
    options = {}
  ) {
    const { prdFile = null } = options;
    if (!(await this.isClaudeCliAvailable())) {
      throw new Error(
        'Claude CLI is not available. Please install Claude Code CLI first.'
      );
    }

    const { TemplateRepository } = require('./template-repository');
    const templateRepo = new TemplateRepository();
    const templateUrl = templateRepo.getTemplateUrl(template);

    // Prepare the prompt for Claude with readable multi-line structure
    const promptParts = [
      `Please bootstrap the current directory as a ${template.language} project called "${projectName}"`,
      description ? `with description "${description}"` : null,

      // Template location information
      `This template is located at: ${template.repository.url} in the ${template.path}/ directory.`,
      `Please fetch the template structure from ${templateUrl}`,

      // Template features and dependencies
      template.features && template.features.length > 0
        ? `Template features: ${template.features.slice(0, 5).join(', ')}.`
        : null,
      template.dependencies && template.dependencies.length > 0
        ? `Required dependencies: ${template.dependencies.slice(0, 5).join(', ')}.`
        : null,

      // Core requirements
      'Follow the BOOTSTRAP.md instructions to create the complete project structure with all necessary files.',
      'Replace all template variables like {{project-name}}, {{project_name}}, {{ProjectName}}, {{author}}, {{year}} with appropriate values.',
      'Set up configuration files, include proper .gitignore and README.md files, and configure any required dependencies or build tools.',
      'Create all files and directories directly in the current working directory (do not create a new project subdirectory).',
      'Create a fully functional project structure ready for development with proper variable substitution in all files and directories.',

      // PRD file information if provided
      prdFile ? `A Product Requirement Document (PRD) file will be available at ${prdFile} - reference this for project requirements and implementation details.` : null
    ];

    // Filter out null entries for cleaner prompt parts
    const filteredPromptParts = promptParts.filter(part => part !== null);

    const spinner = options.verbose
      ? null
      : ora(
        `Asking Claude to bootstrap ${template.language} project...`
      ).start();

    try {

      if (options.verbose) {
        console.log(chalk.cyan('\n[CLAUDE CLI] Generating multi-line Claude command:'));
        console.log(chalk.gray('claude --dangerously-skip-permissions \\'));
        console.log(chalk.gray('      --print \\'));
        console.log(chalk.gray('      --verbose \\'));
        console.log(chalk.gray('      --output-format stream-json \\'));
        console.log(chalk.gray('      "<prompt>"'));
        console.log(
          chalk.cyan(`[CLAUDE CLI] Working directory: ${projectPath}`)
        );
        console.log(
          chalk.cyan('\n[CLAUDE CLI] Prompt sections being sent to Claude:')
        );
        console.log(chalk.gray('─'.repeat(80)));
        filteredPromptParts.forEach((part, index) => {
          console.log(chalk.gray(`${index + 1}. ${part}`));
        });
        console.log(chalk.gray('─'.repeat(80)));
        console.log(
          chalk.cyan('[CLAUDE CLI] Generating bootstrap script...\n')
        );
      }

      // Generate bootstrap script for user to run manually
      const claudeResult = await this.generateClaudeScript(
        filteredPromptParts, // Pass filtered prompt parts
        projectPath,
        { ...options, prdFile }
      );

      if (spinner) {
        spinner.succeed('Bootstrap script generated');
      } else {
        console.log(
          chalk.green('[CLAUDE CLI] ✔ Bootstrap script generated')
        );
      }

      const claudeResponse = claudeResult.response;

      return {
        success: true,
        claudeResponse,
        message: 'Bootstrap script created - user needs to run it manually',
        scriptPath: claudeResult.scriptPath,
        instructions: claudeResult.instructions
      };
    } catch (error) {
      if (spinner) {
        spinner.fail('Claude bootstrap failed');
      } else {
        console.log(chalk.red('[CLAUDE CLI] ✖ Claude bootstrap failed'));
      }

      if (options.verbose) {
        console.log(chalk.red('\n[CLAUDE CLI] Error details:'));
        console.log(chalk.gray('Error message:', error.message));
      }

      return {
        success: false,
        error: error.message,
        message: 'Failed to bootstrap project with Claude Code',
        fallbackRequired: true
      };
    }
  }

  /**
   * Initialize git repository in project directory
   * @param {string} projectPath - Path to project directory
   * @param {boolean} verbose - Show verbose output
   * @returns {boolean} Success status
   */
  async initializeGit(projectPath, verbose = false) {
    try {
      const spinner = verbose
        ? null
        : ora('Initializing git repository...').start();

      if (verbose) {
        console.log(chalk.cyan('[GIT] Executing command: git init'));
        console.log(chalk.cyan(`[GIT] Working directory: ${projectPath}`));
      }

      const { stdout, stderr } = await execAsync('git init', {
        cwd: projectPath
      });

      if (spinner) {
        spinner.succeed('Git repository initialized');
      } else {
        console.log(chalk.green('[GIT] ✔ Git repository initialized'));
      }

      if (verbose) {
        if (stdout) {
          console.log(chalk.gray('[GIT] STDOUT:'), stdout);
        }
        if (stderr) {
          console.log(chalk.gray('[GIT] STDERR:'), stderr);
        }
      }

      return true;
    } catch (gitError) {
      if (verbose) {
        console.log(
          chalk.red('[GIT] ✖ Failed to initialize git repository:'),
          gitError.message
        );
        if (gitError.stderr) {
          console.log(chalk.gray('[GIT] Error output:'), gitError.stderr);
        }
      }
      return false;
    }
  }

  /**
   * Generate a shell script for the user to execute Claude CLI manually
   * @param {Array} promptParts - Array of prompt parts for readable formatting
   * @param {string} workingDir - Working directory
   * @param {Object} options - Execution options
   * @returns {Object} Script generation result
   */
  async generateClaudeScript(
    promptParts,
    workingDir,
    options = { verbose: true, prdFile: null }
  ) {
    const fs = require('fs');
    const path = require('path');

    console.log(chalk.cyan('\n[CLAUDE CLI] Generating bootstrap script for manual execution...'));

    try {
      // Create the bootstrap script in the project directory
      const scriptPath = path.join(workingDir, 'bootstrap-with-claude.sh');

      // Prepare shell script variables
      const generateAgentsFlag = options.generateAgents ? 'true' : 'false';

      // Create comprehensive shell script
      const shellScript = `#!/bin/zsh
# Bootstrap script generated by Claude Wizard
# This script will use Claude Code to bootstrap your project

# Parse command line arguments
DRY_RUN=true  # Default to dry run for safety
APPLY_CHANGES=false
GENERATE_AGENTS=${generateAgentsFlag}

for arg in "$@"; do
    case $arg in
        --apply)
            DRY_RUN=false
            APPLY_CHANGES=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            APPLY_CHANGES=false
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--dry-run|--apply]"
            echo ""
            echo "Options:"
            echo "  --dry-run    Show what would be done without making changes (default)"
            echo "  --apply      Actually execute the bootstrap and make changes"
            echo "  --help       Show this help message"
            echo ""
            exit 0
            ;;
        *)
            echo "Unknown option: $arg"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

echo "🤖 Claude Code Project Bootstrap"
echo "================================"

if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN MODE - No changes will be made"
    echo "Use --apply to actually execute the bootstrap"
else
    echo "⚡ APPLY MODE - Changes will be made to your project"
fi
echo ""

# Check if Claude CLI is available
if ! command -v claude &> /dev/null; then
    echo "❌ Error: Claude CLI is not available in your PATH"
    echo ""
    echo "Please install Claude Code CLI first:"
    echo "  https://claude.ai/code"
    echo ""
    exit 1
fi

# Check if jq is available for better output parsing
if ! command -v jq &> /dev/null; then
    echo "⚠️  Warning: jq is not available - output will be raw JSON"
    echo "   To install jq: brew install jq (macOS) or apt-get install jq (Linux)"
    echo ""
    USE_JQ=false
else
    USE_JQ=true
fi

echo "✅ Claude CLI found: $(which claude)"
echo "📁 Working directory: $(pwd)"
echo ""

# Show important warnings about execution time and token usage
echo "⚠️  IMPORTANT NOTICES:"
echo "   • This process will use Claude Code tokens from your account"
echo "   • Execution time varies based on template complexity and PRD size:"
echo "     - Small templates: ~2-5 minutes"
echo "     - Large templates with detailed PRD: up to 1 hour"
echo "   • The process may appear to hang - this is normal for complex projects"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN: Showing what would be executed without making changes"
    echo ""
else
    echo "🚀 APPLY MODE: Proceeding with actual bootstrap execution"
    echo ""
    echo -n "Continue? (y/N): "
    read -r REPLY
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Bootstrap cancelled by user"
        exit 0
    fi
fi

# Initialize git repository if not already present
if [ ! -d ".git" ]; then
    echo "🔧 Initializing git repository..."
    if git init; then
        echo "✅ Git repository initialized"
    else
        echo "⚠️  Failed to initialize git repository (continuing anyway)"
    fi
    echo ""
else
    echo "✅ Git repository already exists"
    echo ""
fi

${options.prdFile ? `
# Copy PRD file if provided
PRD_FILE="${options.prdFile}"
if [ -n "$PRD_FILE" ] && [ -f "$PRD_FILE" ]; then
    echo "📋 Copying Product Requirement Document..."
    PRD_BASENAME=$(basename "$PRD_FILE")
    if cp "$PRD_FILE" "./$PRD_BASENAME"; then
        echo "✅ PRD copied: $PRD_BASENAME"
    else
        echo "⚠️  Failed to copy PRD file (continuing anyway)"
    fi
    echo ""
elif [ -n "$PRD_FILE" ]; then
    echo "⚠️  PRD file not found: $PRD_FILE (continuing anyway)"
    echo ""
fi
` : ''}

# Function to parse and display Claude output nicely
parse_claude_output() {
    if [ "$USE_JQ" = true ]; then
        while IFS= read -r line; do
            # Parse different types of JSON messages
            if echo "$line" | jq -e '.type == "assistant"' >/dev/null 2>&1; then
                # Extract and display Claude's response
                message=$(echo "$line" | jq -r '.message.content[0].text // empty')
                if [ -n "$message" ]; then
                    echo "🤖 Claude: $message"
                fi
            elif echo "$line" | jq -e '.type == "system"' >/dev/null 2>&1; then
                # System messages - show minimal info
                subtype=$(echo "$line" | jq -r '.subtype // "status"')
                if [ "$subtype" = "init" ]; then
                    echo "🔧 Initializing Claude Code session..."
                fi
            elif echo "$line" | jq -e '.type == "result"' >/dev/null 2>&1; then
                # Result messages - show success/error
                is_error=$(echo "$line" | jq -r '.is_error // false')
                if [ "$is_error" = "false" ]; then
                    echo "✅ Task completed successfully"
                else
                    echo "❌ Task failed"
                fi
            fi
        done
    else
        # Fallback: just show raw output
        cat
    fi
}

# Build Claude prompt with readable sections
echo "📝 Claude prompt sections:"
${promptParts.map((part, index) => `echo "  ${index + 1}. ${part.substring(0, 60)}${part.length > 60 ? '...' : ''}"`).join('\n')}
echo ""

# Combine all prompt parts into a single command
CLAUDE_PROMPT="${promptParts.map(part => part.replace(/"/g, '\\"')).join(' ')}"

if [ "$DRY_RUN" = true ]; then
    echo "🔍 DRY RUN: Would execute the following Claude command:"
    echo ""
    echo "claude --dangerously-skip-permissions \\\\"
    echo "       --print \\\\"
    echo "       --verbose \\\\"
    echo "       --output-format stream-json \\\\"
    echo '       "$CLAUDE_PROMPT"'
    echo ""
    echo "📊 Prompt preview (first 200 chars):"
    echo "\${CLAUDE_PROMPT:0:200}..."
    echo ""
    echo "🎯 After Claude execution, would also run:"
    echo "   claude code init --auto-confirm"
    
    if [ "$GENERATE_AGENTS" = true ]; then
        echo ""
        echo "🤖 Would also auto-generate project agents:"
        echo "   1. Download generate-agents command from GitHub"
        echo "   2. Save to .claude/commands/generate-agents.md"
        echo "   3. Run: claude /generate-agents"
        echo "   4. Create tailored agents in .claude/agents/"
    fi
    
    echo ""
    echo "✅ DRY RUN COMPLETE - No changes were made"
    echo ""
    echo "💡 To actually execute the bootstrap:"
    echo "   ./bootstrap-with-claude.sh --apply"
    exit 0
else
    echo "🚀 Executing Claude to bootstrap your project..."
    if [ "$USE_JQ" = true ]; then
        echo "📊 Parsing output with jq for better readability..."
    fi
    echo ""
fi

# Execute Claude with multi-line formatted command for readability (only in apply mode)
if claude --dangerously-skip-permissions \\
         --print \\
         --verbose \\
         --output-format stream-json \\
         "$CLAUDE_PROMPT" | parse_claude_output; then
    echo ""
    echo "🎯 Now initializing Claude Code in your project..."
    echo ""
    
    # Initialize Claude Code in the project directory
    if claude --dangerously-skip-permissions --print --verbose --output-format stream-json "/init" | parse_claude_output; then
        echo ""
        
        # Auto-generate project agents if requested
        if [ "$GENERATE_AGENTS" = true ]; then
            echo "🤖 Auto-generating project-specific agents..."
            echo ""
            
            # Create commands directory if it doesn't exist
            mkdir -p .claude/commands
            
            # Download generate-agents command from Claude Wizard GitHub repository
            GITHUB_URL="https://raw.githubusercontent.com/moinsen-dev/claude-wizard/main/.claude/commands/generate-agents.md"
            GENERATE_AGENTS_TARGET=".claude/commands/generate-agents.md"
            
            echo "📥 Downloading generate-agents command from GitHub..."
            if command -v curl &> /dev/null; then
                if curl -s -L -o "$GENERATE_AGENTS_TARGET" "$GITHUB_URL"; then
                    if [ -s "$GENERATE_AGENTS_TARGET" ]; then
                        echo "✅ Downloaded generate-agents command"
                        echo ""
                        
                        # Execute agent generation
                        echo "🔍 Analyzing project structure to generate tailored agents..."
                        if claude --dangerously-skip-permissions \\
                                 --print \\
                                 --verbose \\
                                 --output-format stream-json \\
                                 "/generate-agents" | parse_claude_output; then
                            echo ""
                            echo "✅ Project-specific agents generated successfully!"
                            echo "📁 Agents available in .claude/agents/"
                            echo ""
                        else
                            echo ""
                            echo "⚠️  Agent generation failed (you can run '/generate-agents' manually later)"
                            echo ""
                        fi
                    else
                        echo "⚠️  Downloaded file is empty, skipping agent generation"
                        echo ""
                    fi
                else
                    echo "⚠️  Failed to download generate-agents command from GitHub"
                    echo "   URL: $GITHUB_URL"
                    echo "   (continuing without agent generation)"
                    echo ""
                fi
            elif command -v wget &> /dev/null; then
                if wget -q -O "$GENERATE_AGENTS_TARGET" "$GITHUB_URL"; then
                    if [ -s "$GENERATE_AGENTS_TARGET" ]; then
                        echo "✅ Downloaded generate-agents command"
                        echo ""
                        
                        # Execute agent generation
                        echo "🔍 Analyzing project structure to generate tailored agents..."
                        if claude --dangerously-skip-permissions \\
                                 --print \\
                                 --verbose \\
                                 --output-format stream-json \\
                                 "/generate-agents" | parse_claude_output; then
                            echo ""
                            echo "✅ Project-specific agents generated successfully!"
                            echo "📁 Agents available in .claude/agents/"
                            echo ""
                        else
                            echo ""
                            echo "⚠️  Agent generation failed (you can run '/generate-agents' manually later)"
                            echo ""
                        fi
                    else
                        echo "⚠️  Downloaded file is empty, skipping agent generation"
                        echo ""
                    fi
                else
                    echo "⚠️  Failed to download generate-agents command from GitHub"
                    echo "   URL: $GITHUB_URL"
                    echo "   (continuing without agent generation)"
                    echo ""
                fi
            else
                echo "⚠️  Neither curl nor wget available for downloading generate-agents command"
                echo "   Please install curl or wget to use auto-generate agents feature"
                echo "   (continuing without agent generation)"
                echo ""
            fi
        fi
        
        echo "✅ Project bootstrap and initialization completed successfully!"
        echo ""
        echo "📋 Next steps:"
        echo "  1. Review the generated files"
        if [ "$GENERATE_AGENTS" = true ]; then
            echo "  2. Check out your custom agents in .claude/agents/"
            echo "  3. Follow any setup instructions in README.md"
            echo "  4. Install dependencies if needed" 
            echo "  5. Run 'claude' to open interactive mode and use your agents"
        else
            echo "  2. Follow any setup instructions in README.md"
            echo "  3. Install dependencies if needed"
            echo "  4. Run 'claude' to open interactive mode"
        fi
        echo ""
        echo "🗑️  You can delete this script when done: rm bootstrap-with-claude.sh"
    else
        echo ""
        echo "⚠️  Project bootstrap succeeded, but Claude Code initialization failed"
        echo "   You can manually run 'claude' to open interactive mode"
    fi
else
    echo ""
    echo "❌ Claude bootstrap failed!"
    echo "Please check the error messages above and try again."
    echo ""
    exit 1
fi
`;

      // Write the script file
      fs.writeFileSync(scriptPath, shellScript, { mode: 0o755 });

      if (options.verbose) {
        console.log(chalk.cyan('[SCRIPT] Generated:'), scriptPath);
        console.log(chalk.cyan('[SCRIPT] Prompt sections:'), promptParts.length);
        console.log(chalk.cyan('[SCRIPT] Multi-line Claude command with readable formatting'));
      }

      console.log(chalk.green('📄 Bootstrap script created!'));
      console.log('');
      console.log(chalk.white('To complete the bootstrap process:'));
      console.log(chalk.cyan(`  1. cd ${workingDir}`));
      console.log(chalk.cyan('  2. ./bootstrap-with-claude.sh           # Preview (dry-run mode)'));
      console.log(chalk.cyan('  3. ./bootstrap-with-claude.sh --apply   # Execute actual bootstrap'));
      console.log('');
      console.log(chalk.gray('💡 The script defaults to dry-run mode for safety. Use --apply to actually execute.'));
      console.log(chalk.yellow('⚠️  Execution may take 5+ minutes and will use Claude Code tokens.'));

      if (options.generateAgents) {
        console.log(chalk.cyan('🤖 Auto-generate agents: Enabled - Custom agents will be created for your project'));
      } else {
        console.log(chalk.gray('🤖 Auto-generate agents: Disabled'));
      }

      return {
        success: true,
        response: {
          content: 'Bootstrap script generated successfully',
          success: true,
          message: 'User needs to run the generated script manually'
        },
        scriptPath,
        instructions: [
          `cd ${workingDir}`,
          './bootstrap-with-claude.sh           # Preview (dry-run)',
          './bootstrap-with-claude.sh --apply   # Execute bootstrap'
        ]
      };

    } catch (error) {
      console.error(chalk.red('Failed to generate bootstrap script:'), error.message);
      throw error;
    }
  }

  /**
   * Open Claude Code in interactive mode for the project
   * @param {string} projectPath - Path to project directory
   * @param {boolean} verbose - Show verbose output
   */
  async openClaudeCode(projectPath, verbose = false) {
    try {
      if (!(await this.isClaudeCliAvailable())) {
        if (verbose) {
          console.log(
            chalk.yellow('Claude CLI not available for interactive mode')
          );
        }
        return false;
      }

      console.log(
        chalk.cyan('\n🚀 Opening Claude Code for your new project...')
      );

      if (verbose) {
        console.log(
          chalk.cyan('[CLAUDE CLI] Executing command: claude --add-dir')
        );
        console.log(
          chalk.cyan(`[CLAUDE CLI] Project directory: ${projectPath}`)
        );
      }

      // Use spawn instead of exec for interactive process
      const { spawn } = require('child_process');
      const claudeProcess = spawn('claude', ['--add-dir', projectPath], {
        stdio: 'inherit',
        shell: true
      });

      return new Promise((resolve) => {
        claudeProcess.on('close', (code) => {
          resolve(code === 0);
        });
      });
    } catch (error) {
      if (verbose) {
        console.log(chalk.red('Failed to open Claude Code:'), error.message);
      }
      return false;
    }
  }
}

module.exports = { TemplateBootstrapper };
