# Bootstrap Template Guide

A comprehensive guide for creating bootstrap templates that work with the claude-wizard CLI tool.

## 📋 Table of Contents

- [Overview](#overview)
- [Repository Structure](#repository-structure)
- [BOOTSTRAP.md Format](#bootstrapmd-format)
- [Variable Substitution](#variable-substitution)
- [Template Files](#template-files)
- [Best Practices](#best-practices)
- [Examples](#examples)
- [Testing Your Templates](#testing-your-templates)

## Overview

Bootstrap templates in claude-wizard follow a structured format, enabling automatic project initialization with language-specific setups, dependency management, and development tooling. Templates are organized in GitHub repositories with a specific structure that the system can automatically discover and use.

The official template collection is maintained at [moinsen-dev/claude-templates](https://github.com/moinsen-dev/claude-templates).

### Key Concepts

- **Language Directories**: Each template is organized by programming language (e.g., `python/`, `javascript/`, `rust/`)
- **BOOTSTRAP.md**: The core metadata file that describes the template and its setup process
- **Variable Substitution**: Dynamic replacement of placeholders like `{{project-name}}` in template files
- **Package Manager Detection**: Automatic detection and use of appropriate package managers
- **Git Integration**: Automatic repository initialization and setup

## Repository Structure

Your template repository should follow this structure:

```
your-templates-repo/
├── python/                     ← Language directory
│   ├── BOOTSTRAP.md           ← Required: Template metadata and setup
│   ├── main.py                ← Template files with {{variables}}
│   ├── requirements.txt       ← Dependencies
│   ├── pyproject.toml         ← Configuration files
│   ├── .gitignore            ← Project files
│   ├── README.md             ← Project documentation
│   ├── docs/                 ← Optional: Additional docs
│   └── tests/                ← Optional: Test templates
├── javascript/                ← Another language template
│   ├── BOOTSTRAP.md
│   ├── package.json
│   ├── index.js
│   └── ...
├── rust/                      ← More language templates
│   ├── BOOTSTRAP.md
│   ├── Cargo.toml
│   ├── src/
│   │   └── main.rs
│   └── ...
└── README.md                  ← Repository documentation
```

### Required Elements

1. **Language Directory**: Named after the programming language (lowercase)
2. **BOOTSTRAP.md**: The template metadata file (case-sensitive)
3. **Template Files**: Project files with variable substitution placeholders

### Excluded Files

The following files/patterns are automatically excluded during template processing:
- `BOOTSTRAP.md` (metadata only, not copied)
- `.git/` directories
- `docs/` directories (unless they contain template files)
- Node modules, Python caches, build artifacts

## BOOTSTRAP.md Format

The `BOOTSTRAP.md` file is the heart of your template. It provides metadata about the template and setup instructions. Here's the complete format specification:

### Basic Structure

```markdown
# Template Name

Brief description of what this template provides and its primary use case.

## Features
- Feature 1 description
- Feature 2 description  
- Feature 3 description

## Dependencies
- Package 1
- Package 2
- Package 3

## Tools
- Tool 1 description
- Tool 2 description

## Setup

```bash
command 1
command 2
command 3
```

Additional setup notes and instructions.
```

### Section Details

#### 1. Title (Required)
```markdown
# Python FastAPI Template
```
- Use a single `#` heading
- Should be descriptive and specific
- Becomes the template display name

#### 2. Description (Required)
```markdown
A modern Python web API template with FastAPI, async support, and production-ready tooling.
```
- First paragraph after the title
- Should be concise but descriptive
- Explains the template's purpose and main features

#### 3. Features Section
```markdown
## Features
- FastAPI framework with async/await support
- Automatic API documentation with OpenAPI/Swagger
- Docker containerization with multi-stage builds
- Pre-configured testing with pytest and coverage
- Code quality tools: ruff, mypy, pre-commit hooks
- GitHub Actions CI/CD pipeline
- Production-ready logging and error handling
```
- List of key features and capabilities
- Be specific about included tools and frameworks
- Helps users understand what they're getting

#### 4. Dependencies Section
```markdown
## Dependencies
- fastapi
- uvicorn
- pydantic
- pytest
- ruff
```
- List of main packages/libraries
- Don't include dev dependencies separately
- Used for display purposes and package manager detection

#### 5. Tools Section (Optional)
```markdown
## Tools
- Ruff for linting and formatting
- MyPy for static type checking
- Pytest for testing
- Docker for containerization
```
- Development and build tools included
- IDE configurations, linters, formatters
- CI/CD pipeline components

#### 6. Setup Section
```markdown
## Setup

```bash
uv init
uv add fastapi uvicorn
uv add --dev pytest ruff mypy
uv run pytest
```

Run the development server:
```bash
uv run uvicorn main:app --reload
```
```
- Commands that will be executed after template installation
- Use `bash` or `shell` code blocks
- Commands are extracted and can be run automatically
- Include verification steps

### Parsing Rules

The BOOTSTRAP.md parser follows these rules:

1. **Title**: First `#` heading becomes the template name
2. **Description**: First non-heading paragraph becomes the description  
3. **Sections**: `##` headings define sections (case-insensitive matching)
4. **Lists**: `-` or `*` bullet points are parsed as arrays
5. **Code Blocks**: ```bash and ```shell blocks are extracted as setup commands
6. **Flexible Matching**: Section names can include variations:
   - "Dependencies", "Requirements" → `dependencies`
   - "Features" → `features`  
   - "Tools", "Included" → `tools`
   - "Setup", "Installation" → `steps`

## Variable Substitution

Templates support dynamic variable substitution using `{{variable}}` syntax. Variables are replaced in both file content and file paths.

### Available Variables

#### Project Name Variations
```javascript
// If project name is "My Awesome App"
{{project-name}}        // "My Awesome App"
{{project_name}}        // "my_awesome_app"  
{{projectName}}         // "myAwesomeApp"
{{ProjectName}}         // "MyAwesomeApp"
{{project-name-kebab}}  // "my-awesome-app"
```

#### Language and Template
```javascript
{{language}}            // "python" (lowercase)
{{Language}}            // "Python" (capitalized)
{{template}}            // Template name from BOOTSTRAP.md
{{description}}         // Auto-generated description
```

#### User and Date
```javascript
{{author}}              // System username
{{year}}                // Current year (2024)
```

### Usage Examples

#### In File Content
```python
# {{project-name}}

A {{Language}} project created with {{template}}.

Created by: {{author}}
Year: {{year}}

class {{ProjectName}}:
    def __init__(self):
        self.name = "{{project-name}}"
```

#### In File Paths
```
templates/
├── {{project_name}}/
│   ├── __init__.py
│   └── {{project_name}}.py
├── tests/
│   └── test_{{project_name}}.py
└── README.md
```

#### In Configuration Files
```json
{
  "name": "{{project-name-kebab}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "author": "{{author}}"
}
```

## Template Files

### File Organization

Template files should be organized logically within the language directory:

```
python/
├── BOOTSTRAP.md           ← Template metadata
├── {{project_name}}/      ← Main package directory
│   ├── __init__.py
│   ├── main.py           ← Entry point
│   └── utils.py
├── tests/                ← Test directory
│   ├── __init__.py
│   └── test_{{project_name}}.py
├── requirements.txt      ← Dependencies
├── pyproject.toml       ← Python config
├── .gitignore           ← Git configuration
├── Dockerfile           ← Container setup
└── README.md            ← Project documentation
```

### File Content Guidelines

1. **Use Variable Substitution**: Include `{{project-name}}` and other variables where appropriate
2. **Include Comments**: Add helpful comments explaining key sections
3. **Follow Conventions**: Use language-specific conventions and best practices
4. **Keep Updated**: Use current versions of dependencies and tools
5. **Test Thoroughly**: Ensure all files work together after variable substitution

### Example Template File

```python
"""
{{project-name}} - {{description}}

A {{Language}} project created with {{template}}.
Author: {{author}}
Created: {{year}}
"""

import logging
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class {{ProjectName}}:
    """Main application class for {{project-name}}."""
    
    def __init__(self, name: str = "{{project-name}}"):
        self.name = name
        self.version = "1.0.0"
        logger.info(f"Initialized {self.name} v{self.version}")
    
    def run(self) -> None:
        """Run the main application logic."""
        print(f"Hello from {self.name}!")
        print(f"This is a {{Language}} project created with {{template}}")


def main():
    """Entry point for the application."""
    app = {{ProjectName}}()
    app.run()


if __name__ == "__main__":
    main()
```

## Best Practices

### 1. Template Design

- **Single Responsibility**: Each template should serve a specific purpose
- **Current Best Practices**: Follow modern conventions for the language
- **Complete Setup**: Include all necessary configuration files
- **Documentation**: Provide clear README and inline comments
- **Testing**: Include test examples and setup

### 2. BOOTSTRAP.md Quality

- **Clear Title**: Use descriptive, specific names
- **Comprehensive Features**: List all major capabilities
- **Accurate Dependencies**: Keep package lists up-to-date
- **Working Commands**: Test all setup commands
- **Helpful Context**: Explain what users get and why

### 3. Variable Usage

- **Consistent Naming**: Use appropriate case conventions
- **Meaningful Substitution**: Only use variables where they add value
- **Path Safety**: Ensure variable substitution creates valid file paths
- **Content Clarity**: Variables should make sense in context

### 4. File Organization

- **Logical Structure**: Group related files together
- **Standard Conventions**: Follow language-specific directory layouts
- **Clean Repository**: Exclude build artifacts and temporary files
- **Version Control**: Include appropriate .gitignore files

### 5. Maintenance

- **Regular Updates**: Keep dependencies and tools current
- **Test Regularly**: Verify templates work with latest claude-wizard
- **Community Feedback**: Listen to user feedback and issues
- **Documentation**: Keep examples and guides up-to-date

## Examples

### Minimal Python Template

Here's a minimal but complete Python template:

#### `python/BOOTSTRAP.md`
```markdown
# Python Basic Template

A simple Python project template with modern tooling and best practices.

## Features
- Clean project structure with src layout
- Virtual environment setup with uv
- Testing with pytest
- Code formatting with ruff
- Type checking with mypy

## Dependencies
- pytest
- ruff
- mypy

## Setup

```bash
uv init
uv add --dev pytest ruff mypy
uv run pytest
```
```

#### `python/{{project_name}}/__init__.py`
```python
"""{{project-name}} - {{description}}."""

__version__ = "1.0.0"
__author__ = "{{author}}"
```

#### `python/{{project_name}}/main.py`
```python
"""Main module for {{project-name}}."""


def main():
    """Entry point for {{project-name}}."""
    print("Hello from {{project-name}}!")


if __name__ == "__main__":
    main()
```

#### `python/pyproject.toml`
```toml
[project]
name = "{{project-name-kebab}}"
version = "1.0.0"
description = "{{description}}"
authors = [{name = "{{author}}"}]
dependencies = []

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.ruff]
line-length = 88
target-version = "py38"
```

### JavaScript/Node.js Template Example

#### `javascript/BOOTSTRAP.md`
```markdown
# Node.js Express Template

A modern Node.js web application template with Express, TypeScript, and development tooling.

## Features
- Express.js web framework
- TypeScript for type safety
- ESLint and Prettier for code quality
- Jest for testing
- Docker containerization
- GitHub Actions CI/CD

## Dependencies
- express
- typescript
- @types/node
- @types/express

## Tools
- ESLint for linting
- Prettier for formatting
- Jest for testing
- Nodemon for development

## Setup

```bash
npm install
npm run build
npm test
npm run dev
```
```

#### `javascript/package.json`
```json
{
  "name": "{{project-name-kebab}}",
  "version": "1.0.0",
  "description": "{{description}}",
  "author": "{{author}}",
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "nodemon src/index.ts",
    "start": "node dist/index.js",
    "test": "jest"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.4.5",
    "nodemon": "^3.0.1",
    "typescript": "^5.1.6"
  }
}
```

## Testing Your Templates

### 1. Local Testing

Test your templates locally before publishing:

```bash
# Add your repository to claude-wizard config
npx claude-wizard
# Choose "Configure repositories" → "Add repository"

# Test template discovery
npx claude-wizard bootstrap --list-templates

# Test template bootstrapping
npx claude-wizard bootstrap -t your-template --dry-run
```

### 2. Validation Checklist

Before publishing your template repository:

- [ ] Repository structure follows conventions
- [ ] Each language directory has BOOTSTRAP.md
- [ ] BOOTSTRAP.md follows format specification  
- [ ] All variables are used correctly in files
- [ ] Setup commands work and are tested
- [ ] Dependencies are current and accurate
- [ ] Template creates working projects
- [ ] README.md explains the repository
- [ ] .gitignore excludes build artifacts

### 3. Integration Testing

Test the complete workflow:

1. **Template Discovery**: Verify templates appear in `--list-templates`
2. **Variable Substitution**: Check all variables are replaced correctly
3. **File Creation**: Ensure all files are created with correct names
4. **Setup Commands**: Verify setup commands execute successfully
5. **Final Project**: Test that the created project works as expected

### 4. User Testing

Have others test your templates:

- Provide clear usage instructions
- Test on different operating systems
- Verify with different project names (special characters, spaces, etc.)
- Collect feedback on template quality and completeness

## Repository Configuration

### Making Your Repository Available

Users can add your template repository to claude-wizard:

```bash
npx claude-wizard
# Choose "Configure repositories" → "Add repository"
# Enter your repository URL: https://github.com/username/your-templates
# Set type as "templates" or "mixed"
```

### Repository Settings

Configure your repository for optimal compatibility:

```json
{
  "name": "Your Templates",
  "url": "https://github.com/username/your-templates",
  "branch": "main", 
  "type": "templates",
  "description": "Custom project templates",
  "enabled": true
}
```

### Public vs Private

- **Public repositories**: Work out of the box
- **Private repositories**: Require GitHub authentication
- **Organization repositories**: May need specific permissions

## Advanced Features

### Multi-Language Projects

For templates that span multiple languages:

```
fullstack-template/
├── frontend/
│   ├── BOOTSTRAP.md
│   ├── package.json
│   └── src/
├── backend/  
│   ├── BOOTSTRAP.md
│   ├── requirements.txt
│   └── app/
└── README.md
```

### Conditional Content

Use variables for conditional setup:

```bash
# In BOOTSTRAP.md setup section
npm install
{{#if typescript}}
npm install --save-dev typescript @types/node
{{/if}}
npm run build
```

### Complex Substitutions

Advanced variable patterns:

```python
# Multiple transformations
class {{ProjectName}}{{Language}}Service:
    """{{description}} for {{Language}}."""
    pass

# Conditional logic in templates
{{#if database}}
import sqlite3
{{/if}}
```

## Troubleshooting

### Common Issues

1. **Template Not Found**
   - Check directory name matches language exactly
   - Verify BOOTSTRAP.md exists and is spelled correctly
   - Ensure repository is accessible and branch is correct

2. **Variable Substitution Failed**
   - Check variable names are exact (case-sensitive)
   - Ensure `{{}}` braces are properly formatted
   - Verify no extra spaces in variable names

3. **Setup Commands Failed**
   - Test commands manually in a fresh environment
   - Check for missing dependencies or prerequisites
   - Ensure commands are platform-compatible

4. **File Path Issues**
   - Verify file paths don't contain invalid characters after substitution
   - Check for proper directory structure creation
   - Test with various project names including special characters

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Community**: Join discussions about template development
- **Documentation**: Refer to claude-wizard documentation
- **Examples**: Study existing templates in vibe-coding-templates

## Contributing

We welcome contributions to improve this guide and create better templates:

1. **Template Contributions**: Create useful templates for popular languages and frameworks
2. **Documentation**: Improve this guide with examples and clarifications  
3. **Tools**: Build tools to help template creators test and validate their work
4. **Best Practices**: Share insights from creating and maintaining templates

---

**Happy Template Creating! 🚀**

For more information, see the [claude-wizard documentation](../README.md) and explore [example templates](./examples/).