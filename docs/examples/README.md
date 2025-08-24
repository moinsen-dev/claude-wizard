# Bootstrap Template Examples

This directory contains example templates that demonstrate how to create bootstrap templates for claude-wizard.

## Available Examples

### [Minimal Template](./minimal-template/)

A complete minimal Python template that demonstrates:
- **BOOTSTRAP.md** - Proper metadata format and setup commands
- **Variable Substitution** - Using `{{project-name}}`, `{{author}}`, etc.
- **Package Structure** - Modern Python package layout
- **Configuration Files** - pyproject.toml, .gitignore, README.md
- **Testing Setup** - pytest configuration and example tests
- **Development Tools** - ruff, mypy integration

This example serves as a reference implementation showing all the essential elements of a well-structured bootstrap template.

## Using These Examples

### 1. As Learning Material
Study the structure and format to understand how to create your own templates:

```bash
# Explore the minimal template structure
cd docs/examples/minimal-template/
tree .
```

### 2. As a Starting Point
Copy and modify these examples to create your own templates:

```bash
# Copy the minimal template to create a new one
cp -r minimal-template/ my-custom-template/
# Edit BOOTSTRAP.md and template files as needed
```

### 3. For Testing
Use these examples to test template functionality:

```bash
# Test the minimal template with claude-wizard
npx claude-wizard bootstrap -t python --dry-run
```

## Creating Your Own Templates

Follow the [Bootstrap Template Guide](../BOOTSTRAP_TEMPLATE_GUIDE.md) for detailed instructions on creating templates that work with claude-wizard.

### Quick Checklist

- [ ] Create language directory (e.g., `python/`, `javascript/`)
- [ ] Add `BOOTSTRAP.md` with proper format
- [ ] Include template files with `{{variable}}` substitution
- [ ] Add configuration files (package.json, pyproject.toml, etc.)
- [ ] Test with `claude-wizard bootstrap --dry-run`
- [ ] Verify all variables are substituted correctly
- [ ] Test setup commands work in fresh environment

## Contributing Examples

We welcome additional template examples! To contribute:

1. Create a new directory for your template
2. Follow the structure of existing examples
3. Include comprehensive BOOTSTRAP.md documentation
4. Test thoroughly with different project names
5. Add a section to this README describing your example
6. Submit a pull request

## Template Categories

Examples are organized by complexity and use case:

- **minimal-template/** - Basic structure and essential features
- **fullstack-template/** *(planned)* - Complete web application stack
- **microservice-template/** *(planned)* - Containerized service template
- **library-template/** *(planned)* - Reusable library/package template

## Getting Help

- Read the [Bootstrap Template Guide](../BOOTSTRAP_TEMPLATE_GUIDE.md)
- Check the [claude-wizard documentation](../../README.md)
- Look at existing templates in [vibe-coding-templates](https://github.com/chrishayuk/vibe-coding-templates)
- Ask questions in [GitHub Discussions](https://github.com/moinsen-dev/claude-wizard/discussions)