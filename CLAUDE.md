# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Quality Policy

**ZERO TOLERANCE FOR ERRORS AND WARNINGS**

This is a social impact application where failures are not acceptable. We maintain the highest standards of code quality with absolutely NO compromise:

- ✅ 100% TypeScript with strict mode - NO type errors whatsoever
- ✅ 100% ESLint compliance - NO lint errors or warnings (not even a single one)
- ✅ 100% Prettier formatting - NO formatting issues
- ✅ 100% test coverage - NO untested code paths
- ✅ 100% build success - NO compilation errors
- ✅ 100% security compliance - NO vulnerabilities
- ✅ 100% warning-free code - NO warnings of any kind, anywhere in the codebase

**CRITICAL**: This application serves a social good purpose. Any failure, error, or warning is unacceptable. We are committed to maintaining a fully typed, error-free, warning-free codebase at all times. This is not a goal - it is a requirement.

Every commit must pass ALL checks. No exceptions. No compromises. Zero tolerance means zero.

## Common Development Commands

### Run the CLI Tool
```bash
npm start                    # Run with interactive prompts
npm run dev                  # Same as npm start
node bin/claude-wizard.js     # Direct execution
```

### Testing and Quality
```bash
npm test                     # Run Jest unit tests
npm run lint                 # Run ESLint on src/ and bin/
```

### CLI Usage Examples
```bash
# Install agents with specific model
node bin/claude-wizard.js --model opus --assign-colors

# Install as commands instead of agents
node bin/claude-wizard.js --as-commands

# Dry run to preview installation
node bin/claude-wizard.js --dry-run --verbose
```

## Architecture Overview

This is an interactive CLI tool that installs Claude Code agents from GitHub repositories. The application follows a modular architecture with clear separation of concerns:

### Core Components

**Entry Point (`bin/claude-wizard.js`)**
- CLI argument parsing using Commander.js
- Error handling and process management
- Delegates to main application logic

**Main Application (`src/index.js`)**
- Orchestrates the entire installation workflow
- Manages interactive user flows and CLI option overrides
- Handles different installation modes (agents vs commands)
- Coordinates between GitHub API, installer, and user prompts

**GitHub Integration (`src/github.js`)**
- GitHub API client with rate limiting and caching
- Repository structure discovery and agent file downloading
- YAML frontmatter parsing for agent metadata
- Supports both public and private repositories

**Installation Engine (`src/installer.js`)**
- Agent content processing and file system operations
- Support for both agent and command installation formats
- Directory structure creation and file management
- Installation result tracking and error handling

**User Interface (`src/prompts.js`)**
- Interactive prompts using Inquirer.js
- Multi-step installation workflow
- Department and individual agent selection
- Installation confirmation and path selection

**Utilities (`src/utils.js`)**
- YAML frontmatter processing and reconstruction
- Model assignment and color distribution logic
- Agent-to-command format conversion
- Configuration file management and validation

### Data Flow

1. **Initialization**: Load user configuration, set up GitHub API client
2. **Repository Discovery**: Fetch agent structure from configured GitHub repositories
3. **User Interaction**: Present installation options and collect selections
4. **Content Processing**: Download agents, apply transformations (model/color/format)
5. **File System Operations**: Create directories and write processed agent files
6. **State Management**: Update configuration with installation metadata

### Agent Processing Pipeline

**Agent Format** (default):
- Preserves YAML frontmatter with metadata
- Can add model and color fields to frontmatter
- Installs to `~/.claude/agents/` directory structure

**Command Format** (--as-commands):
- Strips YAML frontmatter completely
- Converts to markdown headers (### name, ### description)
- Installs to `~/.claude/commands/` directory

### Configuration System

User preferences stored in `~/.claude-wizard-config.json`:
- Repository configurations (URL, branch, credentials)
- Installation history and metadata tracking
- User preferences for models, colors, and paths
- Color distribution tracking to ensure variety

### GitHub Integration Strategy

- Dynamic agent discovery (no bundled files)
- Caching with TTL to reduce API calls
- Rate limit awareness and backoff
- Support for multiple repositories
- Private repository access via GitHub tokens

### Error Handling

- Network connectivity issues and API failures
- Repository access and authentication problems
- File system permissions and directory creation
- Agent file validation and parsing errors
- Graceful fallback to cached data when possible