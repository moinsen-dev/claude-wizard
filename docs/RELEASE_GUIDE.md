# Release Guide

This guide explains how to create and publish releases for Claude Agents CLI.

## Prerequisites

Before creating a release, ensure you have:

1. **NPM_TOKEN**: Set up in GitHub repository secrets
   - Go to [npmjs.com](https://www.npmjs.com/settings/tokens)
   - Create an "Automation" token
   - Add it to GitHub Secrets as `NPM_TOKEN`

2. **GitHub Permissions**: Ensure the GitHub Actions have proper permissions (already configured in workflows)

3. **Clean Working Directory**: Commit all changes and ensure your working directory is clean

## Release Process

### 1. Automated Release (Recommended)

The easiest way to create a release is using the npm scripts:

```bash
# For bug fixes (0.2.0 -> 0.2.1)
npm run release:patch

# For new features (0.2.0 -> 0.3.0)  
npm run release:minor

# For breaking changes (0.2.0 -> 1.0.0)
npm run release:major
```

This will:
- Run tests and linting
- Update the version in package.json
- Create a git tag
- Push the tag to GitHub
- Trigger the automated release workflow

### 2. Manual Release

If you need more control over the release:

```bash
# 1. Update version manually
npm version 0.3.0 --no-git-tag-version

# 2. Update CHANGELOG.md manually with release notes

# 3. Commit changes
git add .
git commit -m "chore: prepare release v0.3.0"

# 4. Create and push tag
git tag v0.3.0
git push origin v0.3.0
```

## What Happens During Release

When you push a tag (v*), three GitHub Actions will run in parallel:

1. **npm-publish.yml**:
   - Run tests on Node.js 20 and 22
   - Run linting and build processes
   - Publish to npm with provenance

2. **create-release.yml**:
   - Generate release notes from commit history
   - Create GitHub release with installation instructions

3. **changelog.yml**:
   - Update CHANGELOG.md with new version
   - Commit changes back to repository

## Release Types

### Patch Release (x.y.Z)
- Bug fixes
- Documentation updates
- Minor improvements
- Example: `npm run release:patch`

### Minor Release (x.Y.z)
- New features
- New CLI options
- Backward-compatible changes
- Example: `npm run release:minor`

### Major Release (X.y.z)
- Breaking changes
- Major feature overhauls
- API changes
- Example: `npm run release:major`

## Verification

After release, verify:

1. **GitHub Release**: Check the release was created at https://github.com/your-username/claude-agents/releases
2. **NPM Package**: Verify at https://www.npmjs.com/package/claude-agents
3. **Installation**: Test installation with `npx claude-agents@latest`

## Troubleshooting

### NPM Token Issues
If publishing fails:
1. Verify `NPM_TOKEN` is set in GitHub Secrets
2. Ensure token has "Automation" permissions
3. Check token hasn't expired

### Tag Already Exists
If you need to re-release the same version:
```bash
git tag -d v0.2.0
git push origin --delete v0.2.0
# Then create the tag again
```

### Failed Release
If a release fails partway through:
1. Check the GitHub Actions logs
2. Fix any issues
3. Delete the tag if created: `git push origin --delete v0.2.0`
4. Re-run the release process

## Best Practices

1. **Test Before Release**: Always run `npm run build` locally first
2. **Update Documentation**: Ensure README and docs reflect new features
3. **Semantic Versioning**: Follow semver strictly
4. **Release Notes**: Write meaningful commit messages for automatic changelog generation
5. **Pre-release Testing**: Consider using pre-release versions for major changes

## Pre-release Versions

For testing major changes, you can create pre-release versions:

```bash
# Create pre-release (e.g., 0.3.0-alpha.1)
npm version prerelease --preid=alpha
git push origin --tags
```

Pre-release versions will be marked as "pre-release" on GitHub and can be installed with:
```bash
npm install -g claude-agents@next
```