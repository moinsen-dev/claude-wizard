<div align="center">

![Claude Agents CLI](wallpaper.png)

# 🤖 Claude Agents CLI

[![npm version](https://badge.fury.io/js/claude-agents.svg)](https://badge.fury.io/js/claude-agents)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-green.svg)](https://nodejs.org/)

</div>

> **Interactive CLI tool to discover, browse, and install Claude AI agents from GitHub repositories**

Transform your Claude Code experience with a curated collection of specialized AI agents. Browse, preview, and install agents seamlessly with our intuitive command-line interface.

## ✨ Features

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
- **Repository Management** - Add, edit, and manage multiple agent repositories
- **User Preferences** - Set default models, colors, and installation behaviors
- **Validation & Safety** - Repository accessibility checks and confirmation dialogs
- **Statistics & Insights** - Track installed agents and configuration details

## 🚀 Quick Start

### Instant Usage (Recommended)
```bash
npx claude-agents
```

### Global Installation
```bash
npm install -g claude-agents
claude-agents
```

### Command Line Options
```bash
# Install with specific model and auto-assign colors
npx claude-agents --model opus --assign-colors

# Install as commands instead of agents  
npx claude-agents --as-commands

# Preview installation without making changes
npx claude-agents --dry-run --verbose
```

## 📋 Menu Overview

When you run `claude-agents`, you'll see an intuitive menu system:

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
npx claude-agents
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
npx claude-agents --model opus --assign-colors

# Install as commands instead of agents  
npx claude-agents --as-commands

# Preview what would be installed
npx claude-agents --dry-run --verbose
```

### 📁 **Installation Locations**

| Type | Location | Description |
|------|----------|-------------|
| **Agents** | `~/.claude/agents/` | Full Claude Code agents with metadata |
| **Commands** | `~/.claude/commands/` | Simplified command format |
| **Project** | `./.claude/agents/` | Project-specific installation |
| **Custom** | `<your-path>` | Any directory you specify |

## ⚙️ Configuration

The tool automatically creates `~/.claude-agents-config.json` to store:
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
      "url": "https://github.com/your-username/agents",
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
Usage: claude-agents [options]

Options:
  -V, --version        output the version number
  -m, --model <model>  Claude model to assign (opus, sonnet, inherit, none)
  -c, --assign-colors  Auto-assign colors to agents without colors
  --as-commands        Install as commands instead of agents
  --dry-run            Preview what will be installed without installing
  -v, --verbose        Show detailed output
  -h, --help           display help for command
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
git clone https://github.com/your-username/claude-agents.git
cd claude-agents
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
- ✅ 100% ESLint compliance
- ✅ 100% test coverage for utilities
- ✅ Comprehensive error handling
- ✅ Input validation and sanitization

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
- **[Claude Agents Library](https://github.com/your-username/agents)** - Default agent collection

## 📞 Support & Community

- **🐛 Issues**: [GitHub Issues](https://github.com/your-username/claude-agents/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/your-username/claude-agents/discussions)  
- **📖 Documentation**: [Full Documentation](https://github.com/your-username/claude-agents/wiki)
- **🆘 Claude Code Help**: Use `/help` command in Claude Code

---

<div align="center">

**Made with ❤️ for the Claude Code community**

[⭐ Star this repo](https://github.com/your-username/claude-agents) • [🐛 Report bug](https://github.com/your-username/claude-agents/issues) • [💡 Request feature](https://github.com/your-username/claude-agents/issues)

</div>