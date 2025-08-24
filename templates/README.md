# Templates

This directory contains example bootstrap templates for testing and development purposes.

## Available Templates

### Python Template
- **Location**: `python/`
- **Description**: A minimal but complete Python project template
- **Features**: Modern Python package structure, testing with pytest, code quality tools
- **Usage**: Can be used to test the claude-wizard bootstrap functionality

## Testing the Bootstrap System

You can test the bootstrap functionality using these local templates by configuring claude-wizard to use this repository as a template source.

### Local Testing Steps

1. **Configure local repository**:
   ```bash
   # Run claude-wizard and add this repository as a template source
   npx claude-wizard
   # Choose "Configure repositories" → "Add repository"
   # URL: file:///path/to/claude-wizard (or use git remote URL)
   # Type: templates or mixed
   ```

2. **List available templates**:
   ```bash
   npx claude-wizard bootstrap --list-templates
   ```

3. **Test bootstrap with dry run**:
   ```bash
   npx claude-wizard bootstrap -t python --name "My Test Project" --dry-run
   ```

4. **Create actual project**:
   ```bash
   npx claude-wizard bootstrap -t python --name "My Test Project" --path ./test-output
   ```

## Template Structure

Each template follows the standard bootstrap template format:

```
language-name/
├── BOOTSTRAP.md          # Template metadata and setup commands
├── template files...     # Files with {{variable}} substitution
├── README.md            # Template documentation
├── pyproject.toml       # Configuration files
├── tests/               # Test templates
└── {{project_name}}/    # Main package with variable names
```

## Adding More Templates

To add additional templates for testing:

1. Create a new directory for the language (e.g., `javascript/`, `rust/`)
2. Add a `BOOTSTRAP.md` file with proper format
3. Include template files with `{{variable}}` substitution
4. Test with `claude-wizard bootstrap --list-templates`

## Variables Available

All templates support these variables:
- `{{project-name}}` - Original project name
- `{{project_name}}` - Snake case version
- `{{ProjectName}}` - Pascal case version  
- `{{project-name-kebab}}` - Kebab case version
- `{{author}}` - System username
- `{{year}}` - Current year
- `{{language}}` - Language name (lowercase)
- `{{Language}}` - Language name (capitalized)

See the [Bootstrap Template Guide](../docs/BOOTSTRAP_TEMPLATE_GUIDE.md) for complete documentation.