# Release Process

This document describes how to create and publish releases of the claude-wizard CLI tool.

## Prerequisites

1. **NPM_TOKEN Secret**: Ensure the `NPM_TOKEN` secret is configured in your GitHub repository settings
   - Go to Repository Settings → Secrets and variables → Actions
   - Add a secret named `NPM_TOKEN` with your npm authentication token

2. **Repository Access**: Make sure you have push access to the main branch and can create tags

## Release Steps

### 1. Prepare the Release

1. **Update Version**: Update the version in `package.json`
   ```bash
   npm version patch   # for bug fixes (0.2.0 → 0.2.1)
   npm version minor   # for new features (0.2.0 → 0.3.0)
   npm version major   # for breaking changes (0.2.0 → 1.0.0)
   ```

2. **Update CHANGELOG.md**: Document all changes in the changelog
   - Add new version section with date
   - List all new features, changes, and fixes
   - Move from "Unreleased" to the actual version

3. **Test Everything**: Run the full test suite
   ```bash
   npm run lint
   npm test
   npm run start  # Test the CLI locally
   ```

### 2. Create and Push the Release

1. **Commit Changes**:
   ```bash
   git add package.json CHANGELOG.md
   git commit -m "chore: bump version to v0.2.1"
   ```

2. **Create Git Tag**:
   ```bash
   git tag v0.2.1
   ```

3. **Push to GitHub**:
   ```bash
   git push origin main
   git push origin v0.2.1
   ```

### 3. Automatic Publishing

Once you push the tag, GitHub Actions will automatically:

1. **Run Tests**: Execute `npm test` to ensure code quality
2. **Run Linter**: Execute `npm run lint` for code style checks
3. **Publish to npm**: Automatically publish the package if all tests pass

### 4. Verify the Release

1. **Check GitHub Actions**: Monitor the workflow in the "Actions" tab
2. **Verify npm**: Check that the package appears on npmjs.com
3. **Test Installation**: Try installing the published package:
   ```bash
   npm install -g claude-wizard@latest
   claude-wizard --version
   ```

## Workflow Configuration

The release workflow (`.github/workflows/npm-publish.yml`) is triggered by:
- Pushing tags that match the pattern `v*.*.*` (e.g., v0.2.1, v1.0.0)

The workflow will:
- Use Node.js 18
- Install dependencies with `npm ci`
- Run tests and linting
- Publish to npm using the `NPM_TOKEN` secret

## Troubleshooting

### Workflow Fails
- Check the Actions tab for detailed error logs
- Ensure all tests pass locally before creating the tag
- Verify the `NPM_TOKEN` secret is correctly set

### Version Conflicts
- If the version already exists on npm, bump the version and create a new tag
- Delete the problematic tag locally and on GitHub if needed:
  ```bash
  git tag -d v0.2.1
  git push origin :refs/tags/v0.2.1
  ```

### Permission Issues
- Ensure your npm token has publish permissions for the package
- Check that the package name in `package.json` doesn't conflict with existing packages

## Best Practices

1. **Semantic Versioning**: Follow semver principles
2. **Test Before Release**: Always test the CLI functionality before releasing
3. **Detailed Changelog**: Keep the changelog updated with meaningful descriptions
4. **Tag Messages**: Use annotated tags with descriptive messages:
   ```bash
   git tag -a v0.2.1 -m "Release v0.2.1: Fix --as-commands option for agents without YAML frontmatter"
   ```