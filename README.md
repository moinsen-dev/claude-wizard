<div align="center">

![Claude Agents CLI](wallpaper.png)

# 🤖 Claude Agents CLI

[![npm version](https://badge.fury.io/js/claude-wizard.svg)](https://badge.fury.io/js/claude-wizard)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)
[![Test Coverage](https://img.shields.io/badge/coverage-63.83%25-yellowgreen.svg)](https://github.com/moinsen-dev/claude-wizard)
[![Tests](https://img.shields.io/badge/tests-98%20passed-brightgreen.svg)](https://github.com/moinsen-dev/claude-wizard)

</div>

> **Interactive CLI tool to discover, browse, and install Claude AI agents from GitHub repositories, plus bootstrap new projects from templates**

Transform your Claude Code experience with a curated collection of specialized AI agents and project templates. Browse, preview, and install agents seamlessly, or bootstrap new projects with our comprehensive template system.

## ✨ Features

### 🏗️ **Project Bootstrap** *(New in v0.3.0!)*
- **Template-Driven Development** - Bootstrap new projects from curated templates
- **Multiple Languages** - Support for Python, JavaScript, TypeScript, Rust, Go, and more
- **Smart Variable Substitution** - Automatic project name, author, and date replacement
- **Package Manager Detection** - Automatic setup with npm, yarn, pip, uv, cargo, etc.
- **Git Integration** - Initialize repositories with proper .gitignore files
- **Dry-Run Mode** - Preview project structure before creation

### 🔍 **Discover & Browse**
- **Browse by Department** - Explore agents organized by specialty (Engineering, Marketing, Design, etc.)
- **Interactive Agent Preview** - View detailed information, tools, and system prompts before installing
- **Smart Search** - Find agents by name, description, or functionality
- **Real-time Updates** - Always access the latest agents directly from GitHub

### 📦 **Flexible Installation**
- **Multiple Formats** - Install as Claude Code agents or commands
- **Model Configuration** - Pre-configure agents with Claude Opus or Sonnet
- **Color Coordination** - Auto-assign colors for better organization
- **Batch Operations** - Install by department, individual selection, or search results

### ⚙️ **Configuration Management**
- **Unified Repository System** - Manage agents, templates, and mixed repositories
- **Repository Types** - Support for agents, templates, or mixed repository types
- **User Preferences** - Set default models, colors, and installation behaviors
- **Validation & Safety** - Repository accessibility checks and confirmation dialogs
- **Statistics & Insights** - Track installed agents and configuration details

## 🚀 Quick Start

### Instant Usage (Recommended)
```bash
npx claude-wizard
```

### Global Installation
```bash
npm install -g claude-wizard
claude-wizard
```

### Command Line Options
```bash
# Install agents with specific model and auto-assign colors
npx claude-wizard --model opus --assign-colors

# Install as commands instead of agents
npx claude-wizard --as-commands

# Preview installation without making changes
npx claude-wizard --dry-run --verbose

# Bootstrap new projects from templates
npx claude-wizard bootstrap
npx claude-wizard bootstrap --list-templates
npx claude-wizard bootstrap -t python
npx claude-wizard bootstrap --dry-run
npx claude-wizard bootstrap -t python --prd ./requirements.md

# Configuration management
npx claude-wizard reset-config
npx claude-wizard reset-config --keep-user-data
```

## 📋 Menu Overview

When you run `claude-wizard`, you'll see an intuitive menu system:

```
🤖 Claude Agents CLI

✔ Found 37 agents across 8 departments
? What would you like to do?
❯ Browse available agents    ← Explore before installing
  Install agents            ← Choose and install agents
  Update agents            ← Update existing agents
  Remove agents            ← Remove installed agents
  List installed agents    ← View what's installed
  Configure repositories   ← Manage settings
```

### 🔍 **Browse Available Agents**
Perfect for discovery and exploration:
- **By Department** - Navigate Engineering, Marketing, Design, and more
- **View All** - See complete agent catalog with descriptions
- **Search** - Find agents by keywords or functionality
- **Agent Details** - Preview system prompts, tools, and metadata

### 📦 **Install Agents**
Multiple installation methods:
- **All Agents** - Install everything available
- **By Department** - Select entire departments (e.g., all Engineering agents)
- **Individual Selection** - Pick specific agents from organized lists
- **Search & Install** - Find and install agents by search terms

### ⚙️ **Configuration Management**
Complete control over your setup:
- **Repository Management** - Add, edit, or remove GitHub repositories
- **User Preferences** - Set default models, colors, and behaviors
- **View Configuration** - See current settings and statistics
- **Reset to Defaults** - Start fresh with original configuration

## 💡 Usage Examples

### 🎯 **Getting Started - Interactive Mode**
The easiest way to get started is with the interactive interface:

```bash
npx claude-wizard
```

This opens the full menu where you can:
1. **Browse agents** to see what's available
2. **Install** what interests you
3. **Configure** repositories and preferences
4. **Manage** your installed agents

### 🛠 **Command Line Automation**
For automation and scripting:

```bash
# Install with specific model and colors
npx claude-wizard --model opus --assign-colors

# Install as commands instead of agents
npx claude-wizard --as-commands

# Preview what would be installed
npx claude-wizard --dry-run --verbose
```

### 📁 **Installation Locations**

| Type | Location | Description |
|------|----------|-------------|
| **Agents** | `~/.claude/agents/` | Full Claude Code agents with metadata |
| **Commands** | `~/.claude/commands/` | Simplified command format |
| **Project** | `./.claude/agents/` | Project-specific installation |
| **Custom** | `<your-path>` | Any directory you specify |

## ⚙️ Configuration

The tool automatically creates `~/.claude-wizard-config.json` to store:
- **Repository configurations** - GitHub repos and access settings
- **Installation history** - What you've installed and when
- **User preferences** - Default models, colors, and behaviors
- **Cache settings** - Performance optimization settings

### 🏗 **Repository Management**
Add custom agent repositories through the interactive interface or by editing the config:

```json
{
  "repositories": [
    {
      "name": "Claude Agents Library",
      "url": "https://github.com/moinsen-dev/agents",
      "branch": "main",
      "default": true
    },
    {
      "name": "Custom Enterprise Agents",
      "url": "https://github.com/company/custom-agents",
      "branch": "main"
    }
  ]
}
```

## 🎯 Command Line Reference

```bash
Usage: claude-wizard [options] [command]

Commands:
  bootstrap [options]     Bootstrap a new project from templates
  reset-config [options]  Reset configuration to defaults

Options:
  -V, --version        output the version number
  -m, --model <model>  Claude model to assign (opus, sonnet, inherit, none)
  -c, --assign-colors  Auto-assign colors to agents without colors
  --as-commands        Install as commands instead of agents
  --dry-run            Preview what will be installed without installing
  -v, --verbose        Show detailed output
  -h, --help           display help for command

Bootstrap Options:
  -t, --template <name>  Specify template name or language
  -n, --name <name>      Project name
  -p, --path <path>      Project path (default: current directory)
  --prd <file>           Copy Product Requirement Document to project
  --list-templates       List all available templates
  --dry-run              Preview project structure without creating
  --verbose              Show detailed bootstrap process
  --no-install           Skip dependency installation
  --no-git               Skip git repository initialization

Reset Config Options:
  --keep-user-data       Preserve installed agents and preferences
  --verbose              Show detailed configuration output
```

## 🔄 **Agent vs Command Format**

| Feature | Agents (`~/.claude/agents/`) | Commands (`~/.claude/commands/`) |
|---------|------------------------------|----------------------------------|
| **Structure** | Full YAML frontmatter | Markdown headers only |
| **Metadata** | name, description, tools, model, color | name, description only |
| **Organization** | Department folders | Simple file list |
| **Use Case** | Full Claude Code integration | Simplified command palette |

## 📁 Repository Structure

The tool works with GitHub repositories organized by department:

```
your-agents-repo/
├── engineering/           ← Department folder
│   ├── ai-engineer.md    ← Agent file
│   ├── backend-architect.md
│   └── devops-specialist.md
├── marketing/
│   ├── content-creator.md
│   ├── growth-hacker.md
│   └── brand-strategist.md
├── design/
│   ├── ui-designer.md
│   └── ux-researcher.md
└── product/
    ├── product-manager.md
    └── data-analyst.md
```

### Agent File Format
Each agent file uses YAML frontmatter + markdown content:

```yaml
---
name: ai-engineer
description: Full-stack AI engineer specializing in modern development workflows
tools: Read, Write, Edit, WebSearch, Bash
model: opus
color: blue
---

You are an AI Engineer specializing in building production-ready AI applications.
Your expertise spans machine learning, software architecture, and DevOps practices...
```

## 🛠 Development

### Local Setup
```bash
git clone https://github.com/moinsen-dev/claude-wizard.git
cd claude-wizard
npm install
```

### Available Scripts
```bash
npm run dev          # Run the CLI in development mode
npm test             # Run Jest unit tests
npm run lint         # Run ESLint code quality checks
```

### Code Quality Standards
This project maintains **zero tolerance** for errors and warnings:
- ✅ 100% ESLint compliance with pre-commit hooks
- ✅ 98 comprehensive tests with 63.83% coverage
- ✅ 96%+ coverage for all core components
- ✅ Comprehensive error handling and edge cases
- ✅ Input validation and sanitization
- ✅ Automated quality enforcement with Husky

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Add** tests for any new functionality
4. **Ensure** all tests pass: `npm test && npm run lint`
5. **Submit** a pull request with a clear description

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🔗 Related Projects

- **[Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code/sub-agents)** - Official sub-agents documentation
- **[Claude Agents Library](https://github.com/moinsen-dev/agents)** - Default agent collection

## 📞 Support & Community

- **🐛 Issues**: [GitHub Issues](https://github.com/moinsen-dev/claude-wizard/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/moinsen-dev/claude-wizard/discussions)
- **📖 Documentation**: [Full Documentation](https://github.com/moinsen-dev/claude-wizard/wiki)
- **🆘 Claude Code Help**: Use `/help` command in Claude Code

---

<div align="center">

**Made with ❤️ for the Claude Code community**

[⭐ Star this repo](https://github.com/moinsen-dev/claude-wizard) • [🐛 Report bug](https://github.com/moinsen-dev/claude-wizard/issues) • [💡 Request feature](https://github.com/moinsen-dev/claude-wizard/issues)

</div>