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
      initGit = true
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

      // Step 7: Initialize Git repository
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
    if (!(await this.isClaudeCliAvailable())) {
      throw new Error(
        'Claude CLI is not available. Please install Claude Code CLI first.'
      );
    }

    const { TemplateRepository } = require('./template-repository');
    const templateRepo = new TemplateRepository();
    const templateUrl = templateRepo.getTemplateUrl(template);

    // Prepare the prompt for Claude with full template context
    let prompt = `Please bootstrap the current directory as a ${template.language} project called "${projectName}"`;

    if (description) {
      prompt += ` with description "${description}"`;
    }

    // Provide Claude with comprehensive template information
    prompt += `. This template is located at: ${template.repository.url} in the ${template.path}/ directory.`;
    prompt += ` Please fetch the template structure from ${templateUrl}`;

    // Include template features and dependencies for better context
    if (template.features && template.features.length > 0) {
      prompt += `. Template features: ${template.features
        .slice(0, 5)
        .join(', ')}.`;
    }

    if (template.dependencies && template.dependencies.length > 0) {
      prompt += ` Required dependencies: ${template.dependencies
        .slice(0, 5)
        .join(', ')}.`;
    }

    prompt +=
      ' Follow the BOOTSTRAP.md instructions to create the complete project structure with all necessary files.';
    prompt +=
      ' Replace all template variables like {{project-name}}, {{project_name}}, {{ProjectName}}, {{author}}, {{year}} with appropriate values.';
    prompt +=
      ' Set up configuration files, include proper .gitignore and README.md files, and configure any required dependencies or build tools.';
    prompt +=
      ' Create all files and directories directly in the current working directory (do not create a new project subdirectory).';
    prompt +=
      ' Create a fully functional project structure ready for development with proper variable substitution in all files and directories.';

    const spinner = options.verbose
      ? null
      : ora(
        `Asking Claude to bootstrap ${template.language} project...`
      ).start();

    try {
      // Use single quotes to avoid shell interpretation of special characters
      const escapedPrompt = prompt.replace(/'/g, '\'"\'"\'');
      const claudeCommand = `claude --dangerously-skip-permissions --print --verbose --output-format stream-json '${escapedPrompt}'`;

      if (options.verbose) {
        console.log(chalk.cyan('\n[CLAUDE CLI] Executing command:'));
        console.log(chalk.gray(claudeCommand));
        console.log(
          chalk.cyan(`[CLAUDE CLI] Working directory: ${projectPath}`)
        );
        console.log(
          chalk.cyan('\n[CLAUDE CLI] Full prompt being sent to Claude:')
        );
        console.log(chalk.gray('─'.repeat(80)));
        console.log(chalk.gray(prompt));
        console.log(chalk.gray('─'.repeat(80)));
        console.log(
          chalk.cyan('[CLAUDE CLI] Starting streaming execution...\n')
        );
      }

      // Generate bootstrap script for user to run manually
      const claudeResult = await this.generateClaudeScript(
        claudeCommand,
        projectPath,
        options
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
   * @param {string} command - Claude CLI command to execute
   * @param {string} workingDir - Working directory
   * @param {Object} options - Execution options
   * @returns {Object} Script generation result
   */
  async generateClaudeScript(
    command,
    workingDir,
    options = { verbose: true }
  ) {
    const fs = require('fs');
    const path = require('path');

    console.log(chalk.cyan('\n[CLAUDE CLI] Generating bootstrap script for manual execution...'));

    try {
      // Create the bootstrap script in the project directory
      const scriptPath = path.join(workingDir, 'bootstrap-with-claude.sh');

      // Create comprehensive shell script
      const shellScript = `#!/bin/zsh
# Bootstrap script generated by Claude Wizard
# This script will use Claude Code to bootstrap your project

echo "🤖 Claude Code Project Bootstrap"
echo "================================"
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

# Execute the Claude command
echo "🚀 Running Claude to bootstrap your project..."
if [ "$USE_JQ" = true ]; then
    echo "📊 Parsing output with jq for better readability..."
fi
echo ""

# Run Claude with streaming JSON and parse output
if ${command} | parse_claude_output; then
    echo ""
    echo "🎯 Now initializing Claude Code in your project..."
    echo ""
    
    # Initialize Claude Code in the project directory
    if claude --dangerously-skip-permissions --print --verbose --output-format stream-json "/init" | parse_claude_output; then
        echo ""
        echo "✅ Project bootstrap and initialization completed successfully!"
        echo ""
        echo "📋 Next steps:"
        echo "  1. Review the generated files"
        echo "  2. Follow any setup instructions in README.md" 
        echo "  3. Install dependencies if needed"
        echo "  4. Run 'claude' to open interactive mode"
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
        console.log(chalk.cyan('[SCRIPT] Command:'), command);
      }

      console.log(chalk.green('📄 Bootstrap script created!'));
      console.log('');
      console.log(chalk.white('To complete the bootstrap process:'));
      console.log(chalk.cyan(`  1. cd ${workingDir}`));
      console.log(chalk.cyan('  2. ./bootstrap-with-claude.sh'));
      console.log('');
      console.log(chalk.gray('The script will use Claude Code to generate your project files.'));

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
          './bootstrap-with-claude.sh'
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
