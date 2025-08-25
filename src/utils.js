const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const yaml = require('yaml');
const crypto = require('crypto');

const AVAILABLE_COLORS = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
  'pink',
  'cyan'
];

// Model Selection and Color Assignment Functions
function processAgentContent(content, options = {}) {
  const { model, assignColors } = options;

  if (!model && !assignColors) {
    return content; // No processing needed
  }

  try {
    const { metadata, body } = parseYAMLFrontmatter(content);

    // Add model if specified and not inherit
    if (model && model !== 'inherit') {
      metadata.model = model;
    }

    // Add color if flag set and no color exists
    if (assignColors && !metadata.color) {
      metadata.color = getRandomColor();
    }

    return reconstructAgentFile(metadata, body);
  } catch (error) {
    throw new Error(`Failed to process agent content: ${error.message}`);
  }
}

function parseYAMLFrontmatter(content) {
  if (!content.startsWith('---')) {
    throw new Error('No YAML frontmatter found');
  }

  const endIndex = content.indexOf('---', 3);
  if (endIndex === -1) {
    throw new Error('Invalid YAML frontmatter format');
  }

  const frontmatterContent = content.substring(3, endIndex).trim();
  const body = content.substring(endIndex + 3).trim();

  // Use text-based parsing instead of YAML parsing
  const metadata = extractMetadataFromText(frontmatterContent);
  return { metadata, body };
}

function extractMetadataFromText(frontmatterContent) {
  const metadata = {};
  const lines = frontmatterContent.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmedLine.substring(0, colonIndex).trim();
    let value = trimmedLine.substring(colonIndex + 1).trim();

    // Remove quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith('\'') && value.endsWith('\''))
    ) {
      value = value.slice(1, -1);
    }

    // Handle common fields - store all fields, not just specific ones
    if (key === 'tools') {
      // Handle tools as array or string
      if (value.includes(',')) {
        metadata[key] = value.split(',').map((t) => t.trim());
      } else if (value.includes('[') && value.includes(']')) {
        // Handle array format like [tool1, tool2]
        const arrayContent = value.replace(/[[\\]]/g, '');
        metadata[key] = arrayContent.split(',').map((t) => t.trim());
      } else {
        metadata[key] = value;
      }
    } else {
      metadata[key] = value;
    }
  }

  // Ensure we have at least basic metadata
  if (!metadata.name) {
    metadata.name = 'Untitled Agent';
  }
  if (!metadata.description) {
    metadata.description = 'No description available';
  }

  return metadata;
}

function reconstructAgentFile(metadata, body) {
  const yamlString = yaml.stringify(metadata).trim();
  return `---\n${yamlString}\n---\n\n${body}`;
}

// Color assignment with distribution tracking
let colorFrequency = {};
let lastUsedColors = [];

function getRandomColor() {
  // Initialize frequency tracking
  if (Object.keys(colorFrequency).length === 0) {
    AVAILABLE_COLORS.forEach((color) => {
      colorFrequency[color] = 0;
    });
  }

  // Find colors with lowest usage
  const minUsage = Math.min(...Object.values(colorFrequency));
  const availableColors = AVAILABLE_COLORS.filter(
    (color) =>
      colorFrequency[color] === minUsage && !lastUsedColors.includes(color)
  );

  // If all colors recently used, reset and use any low-usage color
  const finalOptions =
    availableColors.length > 0
      ? availableColors
      : AVAILABLE_COLORS.filter((color) => colorFrequency[color] === minUsage);

  // Select random color from options
  const selectedColor =
    finalOptions[Math.floor(Math.random() * finalOptions.length)];

  // Update tracking
  colorFrequency[selectedColor]++;
  lastUsedColors.push(selectedColor);
  if (lastUsedColors.length > 3) {
    lastUsedColors.shift(); // Keep only last 3 colors
  }

  return selectedColor;
}

// Commands conversion function
function convertToCommand(content) {
  try {
    // Check if content has YAML frontmatter
    if (content.startsWith('---')) {
      const { metadata, body } = parseYAMLFrontmatter(content);
      const name = metadata.name || 'unnamed-command';
      const description = metadata.description || 'No description available';

      return `### ${name}

### ${description}

${body}`;
    } else {
      // Handle plain markdown files without YAML frontmatter
      let name = 'unnamed-command';

      // Try to extract name from first markdown header
      const lines = content.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('# ')) {
          name = trimmedLine.substring(2).trim();
          break;
        }
      }

      const description = 'No description available';

      return `### ${name}

### ${description}

${content}`;
    }
  } catch (error) {
    throw new Error(`Failed to convert to command format: ${error.message}`);
  }
}

// Repository types
const REPOSITORY_TYPES = {
  AGENTS: 'agents',
  TEMPLATES: 'templates',
  MIXED: 'mixed'
};

// Load centralized repository configuration
async function loadRepositoryConfig() {
  const configPath = path.join(__dirname, '..', 'config', 'repositories.json');

  try {
    if (await fs.pathExists(configPath)) {
      const repositoryConfig = await fs.readJSON(configPath);
      return repositoryConfig.repositories || [];
    }
  } catch {
    console.warn('Warning: Could not load repository config, using defaults');
  }

  // Fallback to hardcoded defaults if config file is not available
  return [
    {
      name: 'Moinsen Dev Agents',
      url: 'https://github.com/moinsen-dev/agents',
      branch: 'main',
      type: REPOSITORY_TYPES.AGENTS,
      description: 'Default Claude AI agents repository',
      default: true,
      enabled: true
    },
    {
      name: 'Vibe Templates',
      url: 'https://github.com/chrishayuk/vibe-coding-templates',
      branch: 'main',
      type: REPOSITORY_TYPES.TEMPLATES,
      description: 'AI-optimized project templates',
      default: true,
      enabled: true
    },
    {
      name: 'Claude Templates',
      url: 'https://github.com/moinsen-dev/claude-templates',
      branch: 'develop',
      type: REPOSITORY_TYPES.TEMPLATES,
      description: 'Built-in templates for common project types',
      default: false,
      enabled: true
    }
  ];
}

// Merge centralized repository config with user-added repositories
async function mergeRepositoryConfigs(userRepositories = []) {
  const centralizedRepos = await loadRepositoryConfig();
  const mergedRepos = [...centralizedRepos];

  // Add user-added repositories that don't exist in centralized config
  userRepositories.forEach(userRepo => {
    const exists = centralizedRepos.some(centralRepo =>
      centralRepo.url === userRepo.url && centralRepo.branch === userRepo.branch
    );

    if (!exists) {
      mergedRepos.push({
        ...userRepo,
        // Mark as user-added for identification
        userAdded: true
      });
    }
  });

  return mergedRepos;
}

// Configuration Management
async function loadConfig() {
  const configPath = path.join(os.homedir(), '.claude-wizard-config.json');

  try {
    let config = {};
    if (await fs.pathExists(configPath)) {
      config = await fs.readJSON(configPath);
    }

    // Merge centralized repositories with user-added ones
    const repositories = await mergeRepositoryConfigs(config.repositories || []);

    const defaultConfig = {
      defaultInstallPath: path.join(os.homedir(), '.claude', 'agents'),
      repositories,
      installedAgents: [],
      installedCommands: [],
      preferences: {
        showDescriptions: true,
        confirmBeforeInstall: true,
        confirmBeforeBootstrap: true,
        autoInstallDependencies: true,
        autoInitGit: true,
        cacheTimeout: 3600,
        defaultModel: 'inherit',
        autoAssignColors: false
      },
      colorDistribution: {
        lastUsed: [],
        frequency: {}
      }
    };

    const mergedConfig = {
      ...defaultConfig,
      ...config,
      repositories // Always use merged repositories
    };

    const migratedConfig = await migrateConfig(mergedConfig);

    // Save updated config if it changed or doesn't exist
    if (!await fs.pathExists(configPath) || JSON.stringify(config) !== JSON.stringify(migratedConfig)) {
      await fs.writeJSON(configPath, migratedConfig, { spaces: 2 });
    }

    return migratedConfig;
  } catch {
    console.warn('Warning: Could not load config, using defaults');
    const repositories = await loadRepositoryConfig();
    return {
      defaultInstallPath: path.join(os.homedir(), '.claude', 'agents'),
      repositories,
      installedAgents: [],
      installedCommands: [],
      preferences: {
        showDescriptions: true,
        confirmBeforeInstall: true,
        confirmBeforeBootstrap: true,
        autoInstallDependencies: true,
        autoInitGit: true,
        cacheTimeout: 3600,
        defaultModel: 'inherit',
        autoAssignColors: false
      },
      colorDistribution: {
        lastUsed: [],
        frequency: {}
      }
    };
  }
}

async function saveConfig(config) {
  const configPath = path.join(os.homedir(), '.claude-wizard-config.json');

  try {
    await fs.writeJSON(configPath, config, { spaces: 2 });
  } catch {
    console.warn('Warning: Could not save config');
  }
}

async function resetConfig(keepUserData = false) {
  const configPath = path.join(os.homedir(), '.claude-wizard-config.json');

  // Load current config to preserve user data if requested
  let currentConfig = {};
  if (keepUserData) {
    try {
      if (await fs.pathExists(configPath)) {
        currentConfig = await fs.readJSON(configPath);
      }
    } catch {
      // Ignore errors, use empty config
    }
  }

  // Merge centralized repositories with user-added ones if keeping user data
  const repositories = keepUserData
    ? await mergeRepositoryConfigs(currentConfig.repositories || [])
    : await loadRepositoryConfig();

  const defaultConfig = {
    defaultInstallPath: path.join(os.homedir(), '.claude', 'agents'),
    repositories,
    installedAgents: keepUserData ? currentConfig.installedAgents || [] : [],
    installedCommands: keepUserData
      ? currentConfig.installedCommands || []
      : [],
    preferences: {
      showDescriptions: true,
      confirmBeforeInstall: true,
      confirmBeforeBootstrap: true,
      autoInstallDependencies: true,
      autoInitGit: true,
      cacheTimeout: 3600,
      defaultModel: 'inherit',
      autoAssignColors: false
    },
    colorDistribution: keepUserData
      ? currentConfig.colorDistribution || {
        lastUsed: [],
        frequency: {}
      }
      : {
        lastUsed: [],
        frequency: {}
      }
  };

  try {
    await fs.writeJSON(configPath, defaultConfig, { spaces: 2 });
    return defaultConfig;
  } catch (error) {
    throw new Error(`Could not reset configuration: ${error.message}`);
  }
}

// Configuration migration for backward compatibility
async function migrateConfig(config) {
  let migrated = { ...config };
  let changed = false;

  // Migrate repositories to include type field
  if (migrated.repositories) {
    migrated.repositories = migrated.repositories.map((repo) => {
      if (!repo.type) {
        changed = true;
        return {
          ...repo,
          type: REPOSITORY_TYPES.AGENTS, // Default to agents for existing repos
          description: repo.description || 'Legacy repository',
          enabled: repo.enabled !== undefined ? repo.enabled : true
        };
      }
      return repo;
    });
  }

  // Add new preferences if missing
  if (!migrated.preferences.confirmBeforeBootstrap) {
    migrated.preferences.confirmBeforeBootstrap = true;
    changed = true;
  }
  if (!migrated.preferences.autoInstallDependencies) {
    migrated.preferences.autoInstallDependencies = true;
    changed = true;
  }
  if (!migrated.preferences.autoInitGit) {
    migrated.preferences.autoInitGit = true;
    changed = true;
  }

  // Migrate old templateRepositories field if it exists
  if (migrated.templateRepositories) {
    const templateRepos = migrated.templateRepositories.map((repo) => ({
      ...repo,
      type: REPOSITORY_TYPES.TEMPLATES,
      enabled: repo.enabled !== undefined ? repo.enabled : true
    }));

    migrated.repositories = [...migrated.repositories, ...templateRepos];
    delete migrated.templateRepositories;
    changed = true;
  }

  return changed ? migrated : config;
}

// Installation metadata tracking
function getInstallationMetadata(agentPath, sourceRepo, options = {}) {
  const content = fs.readFileSync(agentPath, 'utf8');
  const hash = crypto.createHash('sha256').update(content).digest('hex');

  return {
    installedAt: new Date().toISOString(),
    hash: hash.substring(0, 12),
    source: sourceRepo,
    type: options.installationType || 'agent',
    model: options.model || null,
    hasColor: options.assignColors || false
  };
}

// Validation functions
function validateAgentFile(content) {
  try {
    parseYAMLFrontmatter(content);
    return true;
  } catch {
    return false;
  }
}

async function ensureDirectory(dirPath) {
  try {
    await fs.ensureDir(dirPath);
    return true;
  } catch (error) {
    throw new Error(`Cannot create directory ${dirPath}: ${error.message}`);
  }
}

async function backupExisting(filePath) {
  if (await fs.pathExists(filePath)) {
    const backupPath = `${filePath}.backup.${Date.now()}`;
    await fs.copy(filePath, backupPath);
    return backupPath;
  }
  return null;
}

// Repository helper functions
function getRepositoriesByType(repositories, type) {
  return repositories.filter(
    (repo) => repo.type === type && repo.enabled !== false
  );
}

function getDefaultRepository(repositories, type) {
  return (
    repositories.find(
      (repo) =>
        repo.type === type && repo.default === true && repo.enabled !== false
    ) || null
  );
}

function validateRepositoryType(type) {
  return Object.values(REPOSITORY_TYPES).includes(type);
}

// Repository validation
function validateRepository(repository) {
  const errors = [];

  if (!repository.name || !repository.name.trim()) {
    errors.push('Repository name is required');
  }

  if (!repository.url || !repository.url.trim()) {
    errors.push('Repository URL is required');
  } else if (!repository.url.includes('github.com')) {
    errors.push('Repository must be a GitHub URL');
  }

  if (!repository.branch || !repository.branch.trim()) {
    errors.push('Repository branch is required');
  }

  if (!repository.type) {
    errors.push('Repository type is required');
  } else if (!validateRepositoryType(repository.type)) {
    errors.push(
      `Invalid repository type. Must be one of: ${Object.values(
        REPOSITORY_TYPES
      ).join(', ')}`
    );
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Configuration validation
function validateConfiguration(config) {
  const errors = [];

  if (!config.repositories || !Array.isArray(config.repositories)) {
    errors.push('Repositories must be an array');
  } else if (config.repositories.length === 0) {
    errors.push('At least one repository is required');
  } else {
    // Validate each repository
    config.repositories.forEach((repo, index) => {
      const repoValidation = validateRepository(repo);
      if (!repoValidation.isValid) {
        errors.push(
          `Repository ${index + 1}: ${repoValidation.errors.join(', ')}`
        );
      }
    });

    // Check for default repository
    const defaultRepos = config.repositories.filter((r) => r.default);
    if (defaultRepos.length === 0) {
      errors.push('One repository must be marked as default');
    } else if (defaultRepos.length > 1) {
      errors.push('Only one repository can be marked as default');
    }
  }

  if (!config.preferences || typeof config.preferences !== 'object') {
    errors.push('Preferences must be an object');
  } else {
    const prefs = config.preferences;

    if (
      prefs.defaultModel &&
      !['inherit', 'opus', 'sonnet', 'none'].includes(prefs.defaultModel)
    ) {
      errors.push(
        'Invalid default model. Must be: inherit, opus, sonnet, or none'
      );
    }

    if (
      typeof prefs.autoAssignColors !== 'undefined' &&
      typeof prefs.autoAssignColors !== 'boolean'
    ) {
      errors.push('autoAssignColors must be a boolean');
    }

    if (
      typeof prefs.confirmBeforeInstall !== 'undefined' &&
      typeof prefs.confirmBeforeInstall !== 'boolean'
    ) {
      errors.push('confirmBeforeInstall must be a boolean');
    }

    if (
      typeof prefs.showDescriptions !== 'undefined' &&
      typeof prefs.showDescriptions !== 'boolean'
    ) {
      errors.push('showDescriptions must be a boolean');
    }

    if (
      prefs.cacheTimeout &&
      (typeof prefs.cacheTimeout !== 'number' || prefs.cacheTimeout <= 0)
    ) {
      errors.push('cacheTimeout must be a positive number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// URL validation for GitHub repositories
function isValidGitHubUrl(url) {
  try {
    const { URL } = require('url');
    const parsed = new URL(url);
    return (
      parsed.hostname === 'github.com' && parsed.pathname.split('/').length >= 3
    );
  } catch {
    return false;
  }
}

module.exports = {
  processAgentContent,
  parseYAMLFrontmatter,
  extractMetadataFromText,
  reconstructAgentFile,
  getRandomColor,
  convertToCommand,
  loadConfig,
  loadRepositoryConfig,
  mergeRepositoryConfigs,
  saveConfig,
  resetConfig,
  migrateConfig,
  getInstallationMetadata,
  validateAgentFile,
  ensureDirectory,
  backupExisting,
  validateRepository,
  validateConfiguration,
  isValidGitHubUrl,
  getRepositoriesByType,
  getDefaultRepository,
  validateRepositoryType,
  AVAILABLE_COLORS,
  REPOSITORY_TYPES
};
