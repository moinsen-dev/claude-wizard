# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1] - 2025-08-25

### Added
- **🧪 Comprehensive Test Coverage for Installer Module** - Added complete test suite for installer.js
  - 10 comprehensive test cases covering all major functionality
  - 89.36% statement coverage, 67.56% branch coverage, 88.88% function coverage
  - Tests for agent installation, removal, listing, and configuration synchronization
  - Proper mocking of external dependencies (fs-extra, ora, chalk, GitHub API, utils)
- **⚙️ Centralized Repository Configuration System** - Implemented centralized config management
  - New `config/repositories.json` as single source of truth for repository definitions
  - Smart merging system that combines centralized repositories with user-added ones
  - `loadRepositoryConfig()` and `mergeRepositoryConfigs()` functions for dynamic configuration
  - Automatic migration preserves existing user customizations
- **📋 Complete Configuration Management Support** - Fixed missing ClackPrompts methods
  - Added `selectConfigurationAction()` for configuration menu navigation
  - Added `selectRepositoryAction()`, `getRepositoryInfo()`, `editRepository()` methods
  - Added `selectPreferences()`, `confirmReset()`, `confirmRepositoryRemoval()` methods
  - Added `confirmInstallation()`, `confirmContinueBrowsing()` methods
  - Full feature parity with original Prompts class for configuration management

### Changed
- **🏗️ Repository Configuration Architecture** - Moved from hardcoded to centralized configuration
  - Repository definitions now loaded from `config/repositories.json`
  - User-added repositories preserved and merged with centralized defaults
  - Backward compatibility maintained for existing user configurations
  - Built-in repositories marked as `[BUILT-IN]`, user repositories marked as `[USER-ADDED]`
- **📈 Test Coverage Improvement** - Overall test coverage increased from 25.8% to 30.09%
  - Added comprehensive installer module testing (+4.29 percentage points)
  - Foundation laid for systematic coverage improvement across all modules

### Fixed
- **🐛 Configuration Menu Runtime Errors** - Resolved "function is not a function" errors
  - Fixed missing `selectConfigurationAction` method causing CLI crashes
  - Fixed missing repository management methods in ClackPrompts
  - Fixed missing preference management methods for complete configuration workflow
- **🔧 JSON Syntax Errors** - Fixed malformed `config/repositories.json`
  - Fixed unquoted property names and values using JavaScript syntax instead of JSON
  - Fixed usage of variable `REPOSITORY_TYPES.TEMPLATES` instead of string literal
  - Fixed trailing commas and extra comma syntax errors
  - Validated JSON parsing to ensure file integrity
- **📱 ESLint Compliance** - Fixed code quality issues
  - Fixed string quote consistency (single quotes)
  - Fixed indentation issues in utils.js
  - Fixed trailing spaces and unused parameter warnings
  - Maintained zero ESLint errors/warnings

### Technical Improvements
- **🎯 Configuration System Refactoring** - Complete overhaul of configuration management
  - Single responsibility principle: centralized config vs user preferences
  - Dynamic configuration loading with fallback mechanisms
  - Proper error handling and graceful degradation
- **✅ Testing Infrastructure Enhancement** - Established patterns for comprehensive testing
  - Jest mocking patterns for external dependencies
  - Async testing patterns for file system and network operations
  - Mock management best practices for complex integration testing
- **🔄 Migration Strategy** - Seamless upgrade path for existing users
  - Automatic detection and preservation of user customizations
  - No breaking changes to existing configurations
  - Progressive enhancement of centralized features

### Benefits
- **⚡ Maintainability** - Repository configuration now manageable from single JSON file
- **🛡️ Reliability** - Complete test coverage ensures installer functionality stability
- **🔧 Extensibility** - Configuration system ready for future enhancements
- **📊 Quality Assurance** - Test coverage metrics provide clear improvement targets

## [0.4.0] - 2025-08-25

### BREAKING CHANGES
- **🏗️ Repository Split: Templates Moved to Dedicated Repository**
  - **Templates migrated** from `templates/` directory to separate [claude-templates repository](https://github.com/moinsen-dev/claude-templates)
  - **Removed local templates** - All template content now served from dedicated repository
  - **Configuration updated** - CLI automatically discovers templates from new repository structure
  - **No user action required** - Templates continue to work seamlessly for existing users

### Added
- **🧪 Comprehensive Bash Escaping Tests** - Added `test/bash-escaping.test.js` with 7 test cases
  - Regression tests for parentheses and quote escaping issues
  - Validation of bash syntax in generated bootstrap scripts
  - Edge case testing for special characters in template content
- **📋 Enhanced Template Discovery** - Improved repository management system
  - Support for multiple template repository sources
  - Better error handling and fallback mechanisms
  - Repository type-aware configuration (agents vs templates)

### Changed
- **🏛️ Architecture: Clean Separation of Concerns**
  - **CLI repository** focuses on core application logic (336KB smaller, 73+ files removed)
  - **Template repository** dedicated to template content and documentation
  - **Independent versioning** allows template updates without CLI releases
  - **Better contributor experience** with focused repositories for different concerns
- **📚 Documentation Updates** - Updated guides and README to reference new repository structure
- **⚙️ Configuration Management** - Enhanced repository configuration with type-aware handling

### Fixed
- **🔧 ESLint Configuration** - Added missing `it` global for Jest test files
- **📦 Package Configuration** - Updated Jest patterns to reflect new repository structure

### Benefits
- **⚡ Faster Operations** - Reduced main repository size improves clone and operation speeds
- **🔄 Independent Releases** - Templates can be updated independently from CLI releases
- **🎯 Focused Development** - Clear separation between CLI development and template creation
- **📈 Scalability** - Template collection can grow without impacting CLI repository
- **👥 Better Collaboration** - Template contributors can focus purely on template development

### Migration Guide
- **🔄 Automatic Migration** - No manual steps required for existing users
- **🔍 Template Discovery** - CLI automatically discovers templates from new repository
- **📍 New Repository** - Templates now available at [moinsen-dev/claude-templates](https://github.com/moinsen-dev/claude-templates)
- **🛠️ Development Setup** - Template contributors should clone new repository for template development

**Addresses:** [Issue #6 - Split Templates into dedicated repository](https://github.com/moinsen-dev/claude-wizard/issues/6)

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