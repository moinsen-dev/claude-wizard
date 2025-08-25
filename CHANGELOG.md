# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.3] - 2025-08-25

### Fixed
- **🐛 Bootstrap Script Bash Syntax Errors** - Resolved critical bash syntax errors in generated bootstrap scripts
  - Fixed unescaped parentheses in echo statements causing `syntax error near unexpected token '('`
  - Fixed unescaped parentheses in CLAUDE_PROMPT variable assignment
  - Added proper escaping for parentheses `()` as `\(\)` in all bash string literals
  - Fixed specific issues with "(PRD)" and "(do not create...)" text in generated scripts
- **🔗 Branch Reference Fix** - Updated hardcoded GitHub branch references
  - Changed hardcoded `main` branch to `develop` for generate-agents command downloads
  - Fixed bootstrap scripts downloading from incorrect branch when using auto-generate agents feature
  - Ensures compatibility with project's actual default branch structure

### Technical Improvements
- Enhanced bash string escaping in template-bootstrapper.js for both echo lines and variable assignments
- Added comprehensive escaping for quotes `"` as `\"` and parentheses `()` as `\(\)` 
- Improved bootstrap script generation reliability across different shell environments

## [0.3.2] - 2025-08-25

### Fixed
- **🐛 Shell Script Read Command Issue** - Resolved bootstrap script failure with 'read -p' command
  - Replaced problematic `read -p` with compatible `echo -n` + `read -r` pattern
  - Improved cross-platform shell compatibility for interactive prompts
  - Fixed 'read:90: -p: no coprocess' error in bootstrap execution
- **🔄 Bootstrap Flow Exit Issue** - Fixed application continuing after bootstrap completion
  - Application now properly exits after showing manual script execution message
  - Improved error handling in interactive bootstrap creation flow
  - Prevents infinite loop when bootstrap script generation succeeds

### Changed
- **⚡ Enhanced Cross-Platform Compatibility** - Improved shell script compatibility across different environments

## [0.3.1] - 2025-08-25

### Added
- **🔄 Configuration Reset Command** - New `reset-config` command to restore default settings
  - Complete reset option removes all user data
  - `--keep-user-data` flag preserves installed agents and preferences
  - Interactive confirmation prompt for safety
  - Verbose mode shows full configuration details
- **📋 PRD Copy Feature for Bootstrap** - Copy Product Requirement Documents during project creation
  - `--prd <file>` option for bootstrap command
  - Automatic PRD file validation and copying
  - Integration with both standard and Claude-based bootstrap methods
  - Support for PRD files in bootstrap scripts

### Fixed
- **🐛 Template Discovery Issues** - Resolved 404 errors during template parsing (Issue #4)
  - Fixed incorrect template discovery logic that scanned documentation directories
  - Added proper filtering to only parse directories with BOOTSTRAP.md files
  - Eliminated false error messages for docs/ and examples/ directories
  - Improved error handling to distinguish between expected and actual errors
- **📝 Default Branch Configuration** - Updated repository configuration (Issue #5)
  - Changed Claude Wizard Templates repository branch from feature branch to 'develop'
  - Ensured consistent default branch references across configuration

### Technical Improvements
- Enhanced template repository structure validation
- Improved error messaging and user experience
- Added comprehensive test coverage for new features
- Updated documentation and inline comments

## [0.3.0] - 2024-08-24

### Added
- **🏗️ Project Bootstrap System** - Revolutionary new feature for creating projects from templates
  - `claude-wizard bootstrap` command for project initialization
  - Support for vibe-coding-templates format and structure
  - Template discovery from multiple GitHub repositories
  - Interactive template selection (coming soon)
  - Template variable substitution ({{project-name}}, {{author}}, etc.)
  - Automatic dependency installation and project setup
  - Git repository initialization
  - Dry-run mode for preview without changes
- **🔧 Unified Repository Management**
  - Repository types: agents, templates, mixed
  - Type-aware repository operations and filtering
  - Backward compatibility with existing configurations
  - Automatic configuration migration
- **⚙️ Advanced Template Engine**
  - BOOTSTRAP.md file parsing and metadata extraction
  - Project variable processing with multiple naming conventions
  - Package manager detection (npm, yarn, pip, uv, cargo, go)
  - Language-specific setup commands and next steps
  - Template validation and error handling
- **📱 Flutter Template Creation**
  - Complete Flutter template with Bloc architecture and Domain-driven design
  - Patrol testing framework integration for native UI testing
  - Multi-platform support (iOS, Android, Web, Desktop) with responsive design
  - Dark/light theme switching with Material Design 3
  - Go Router navigation and internationalization (i18n) support
  - Custom styled components with consistent design patterns
  - CodeMagic CI/CD configuration for automated builds and testing
  - No code generation approach with pure Dart implementations
- **🧪 Development Quality Improvements**
  - Pre-commit hooks with automatic lint:fix using Husky
  - Comprehensive test coverage (98 tests, 63.83% overall coverage)
  - Bootstrap functionality: 96.24% test coverage
  - Repository management: 97.4% test coverage
  - Template system: 92.98% test coverage

### Changed
- **Repository System**: Unified architecture supporting multiple repository types
- **Configuration Format**: Enhanced to support template repositories alongside agent repositories
- **CLI Structure**: Added bootstrap command with comprehensive options
- **Error Handling**: Improved error messages and user feedback throughout

### Technical
- **New Core Components**: RepositoryManager, TemplateRepository, TemplateBootstrapper classes
- **Testing**: Added 5 new test suites with comprehensive edge case coverage
- **Code Quality**: Maintained zero ESLint errors/warnings with automated enforcement
- **Git Hooks**: Pre-commit automation ensures code quality on every commit

### Bootstrap Command Options
```bash
claude-wizard bootstrap                    # Interactive mode
claude-wizard bootstrap --list-templates  # List available templates
claude-wizard bootstrap -t python         # Use specific template
claude-wizard bootstrap --dry-run         # Preview without changes
claude-wizard bootstrap --verbose         # Detailed output
```

## [0.2.0] - 2025-01-XX

### Added
- **Browse Available Agents** - New menu option to explore available agents before installing
  - Browse by department with agent counts
  - Browse all agents in organized lists
  - Search agents by keywords
  - View detailed agent information including metadata, tools, and system prompt previews
  - Agent statistics (content length, file location)
- **Complete Configuration Management System**
  - Repository management (add, edit, remove, set default)
  - Repository validation with GitHub accessibility checks
  - User preferences configuration (model, colors, confirmations, cache settings)
  - View current configuration with statistics
  - Reset to defaults functionality
  - Safe confirmation dialogs for destructive operations
- **Enhanced CLI Options**
  - Removed duplicate `--commands` flag, kept more descriptive `--as-commands`
  - Improved help output clarity

### Changed
- **Menu Structure**: Reordered main menu to put "Browse available agents" first for better discoverability
- **Agent Details**: Enhanced agent preview with truncated system prompts (300 chars) for better readability
- **Error Handling**: Improved network error messages and GitHub API error handling
- **Navigation**: Added consistent back navigation throughout all menu systems

### Technical
- **Code Quality**: Achieved 100% ESLint compliance with zero errors/warnings
- **Architecture**: Modular configuration management with proper validation
- **Performance**: Efficient agent loading with caching and loading spinners
- **Testing**: Maintained 100% test coverage for core utilities

## [0.1.0] - 2025-01-XX

### Added
- **Initial Release** - Interactive CLI for installing Claude AI agents from GitHub repositories
- **Core Installation Features**
  - Install agents from GitHub repositories
  - Support for both agent and command formats
  - Model assignment (Claude Opus, Sonnet, inherit, none)
  - Automatic color assignment for agents
  - Multiple installation methods (all agents, by department, individual selection, search)
- **GitHub Integration**
  - Dynamic agent discovery from repository structures
  - Support for public repositories
  - Caching with configurable TTL
  - Rate limit handling
- **Agent Management**
  - List installed agents
  - Update agents (placeholder)
  - Remove agents functionality
  - Installation history tracking
- **Command Line Interface**
  - Interactive prompts using Inquirer.js
  - Command-line flags for automation
  - Dry-run mode for previewing installations
  - Verbose output option
- **Configuration System**
  - JSON-based configuration file (`~/.claude-wizard-config.json`)
  - Default repository configuration
  - User preferences storage
  - Color distribution tracking
- **Agent Processing**
  - YAML frontmatter parsing and modification
  - Agent-to-command format conversion
  - Content validation
  - Backup functionality
- **Quality Assurance**
  - Comprehensive ESLint configuration
  - Jest unit tests for utilities
  - Error handling and validation
  - Input sanitization

### Technical Details
- **Dependencies**: Inquirer.js, Chalk, Commander, Axios, fs-extra, ora, yaml, node-cache
- **Node.js**: Compatible with Node.js 14+
- **Architecture**: Modular design with separation of concerns
- **Error Handling**: Graceful network error handling and user feedback
- **Validation**: Repository URL validation and agent file integrity checks