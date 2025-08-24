# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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