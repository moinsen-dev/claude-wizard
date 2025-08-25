const { GitHubAPI } = require('./github');
const { REPOSITORY_TYPES } = require('./utils');
const { warningManager } = require('./warning-manager');

class TemplateRepository extends GitHubAPI {
  constructor() {
    super();
  }

  /**
   * Discover templates from multiple repositories
   * @param {Array} repositories - Array of template repositories
   * @returns {Object} Templates grouped by language/category
   */
  async discoverTemplates(repositories) {
    const templateRepos = repositories.filter(repo =>
      (repo.type === REPOSITORY_TYPES.TEMPLATES || repo.type === REPOSITORY_TYPES.MIXED) &&
      repo.enabled !== false
    );

    if (templateRepos.length === 0) {
      return {};
    }

    const allTemplates = {};

    for (const repo of templateRepos) {
      try {
        const repoTemplates = await this.discoverRepositoryTemplates(repo);

        // Merge templates from this repository
        Object.keys(repoTemplates).forEach(category => {
          if (!allTemplates[category]) {
            allTemplates[category] = [];
          }

          // Add repository metadata to each template
          const templatesWithRepo = repoTemplates[category].map(template => ({
            ...template,
            repository: repo
          }));

          allTemplates[category].push(...templatesWithRepo);
        });
      } catch (error) {
        warningManager.addWarning(`Failed to fetch templates from ${repo.name}: ${error.message}`);
      }
    }

    return allTemplates;
  }

  /**
   * Discover templates from a single repository
   * @param {Object} repository - Repository configuration
   * @returns {Object} Templates from this repository
   */
  async discoverRepositoryTemplates(repository) {
    const structure = await this.fetchTemplateRepositoryStructure(repository.url, repository.branch);

    // Look for vibe-templates format (directories with BOOTSTRAP.md files)
    const templates = await this.parseVibeTemplateStructure(structure, repository);

    // TODO: Add support for generic template formats

    return templates;
  }

  /**
   * Fetch repository structure optimized for templates
   * @param {string} repoUrl - Repository URL
   * @param {string} branch - Branch name
   * @returns {Object} Repository structure grouped by directory
   */
  async fetchTemplateRepositoryStructure(repoUrl, branch = 'main') {
    const cacheKey = `template_structure_${repoUrl}_${branch}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const { owner, repo } = this.parseRepoUrl(repoUrl);
    const encodedBranch = encodeURIComponent(branch);
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodedBranch}?recursive=1`;

    try {
      const response = await this.makeRequest(url);
      const structure = this.parseTemplateTreeResponse(response.data);
      this.cache.set(cacheKey, structure);
      return structure;
    } catch (error) {
      throw new Error(`Failed to fetch template repository structure: ${error.message}`);
    }
  }

  /**
   * Parse GitHub API tree response for template repositories
   * @param {Object} data - GitHub API tree response
   * @returns {Object} Structure grouped by directories (maintaining hierarchy)
   */
  parseTemplateTreeResponse(data) {
    const structure = {};

    data.tree.forEach(item => {
      const pathParts = item.path.split('/');

      // Only process items that are in subdirectories (not root)
      if (pathParts.length > 1) {
        // For nested paths like templates/python/file.py, we want to group by:
        // - Top-level: templates
        // - Second-level: templates/python

        const topLevelDir = pathParts[0];

        // Add to top-level directory
        if (!structure[topLevelDir]) {
          structure[topLevelDir] = [];
        }

        structure[topLevelDir].push({
          name: pathParts[pathParts.length - 1],
          path: item.path,
          type: item.type,
          url: item.url
        });

        // Also create entries for nested directories (like templates/python)
        if (pathParts.length > 2) {
          const nestedDir = pathParts.slice(0, 2).join('/'); // e.g., "templates/python"

          if (!structure[nestedDir]) {
            structure[nestedDir] = [];
          }

          structure[nestedDir].push({
            name: pathParts[pathParts.length - 1],
            path: item.path,
            type: item.type,
            url: item.url
          });
        }
      }
    });

    return structure;
  }

  /**
   * Parse vibe-coding-templates repository structure
   * @param {Object} structure - Repository file structure
   * @param {Object} repository - Repository configuration
   * @returns {Object} Parsed templates grouped by language
   */
  async parseVibeTemplateStructure(structure, repository) {
    const templates = {};

    // Look for directories that contain BOOTSTRAP.md files
    // Only consider directories that actually have BOOTSTRAP.md, not documentation directories
    const languageDirectories = Object.keys(structure).filter(key => {
      const items = structure[key];
      // Check if this directory contains a BOOTSTRAP.md file
      const hasBootstrap = items && items.some(item => item.name === 'BOOTSTRAP.md');

      // Filter out documentation and non-template directories
      const isValidTemplateDir = !key.startsWith('docs/') &&
                                !key.startsWith('examples/') &&
                                key !== 'docs' &&
                                key !== 'examples' &&
                                !key.endsWith('/docs') &&
                                !key.endsWith('/examples');

      return hasBootstrap && isValidTemplateDir;
    });

    for (const langDir of languageDirectories) {
      // Extract language name from path (e.g., 'templates/python' -> 'python')
      const languageName = langDir.includes('/') ? langDir.split('/').pop() : langDir;
      const language = this.normalizeLanguageName(languageName);

      try {
        const template = await this.parseLanguageTemplate(langDir, repository);
        if (template) {
          if (!templates[language]) {
            templates[language] = [];
          }
          templates[language].push(template);
        }
      } catch (error) {
        warningManager.addWarning(`Failed to parse template ${langDir}: ${error.message}`);
      }
    }

    return templates;
  }

  /**
   * Parse a single language template
   * @param {string} languageDir - Language directory path
   * @param {Object} repository - Repository configuration
   * @returns {Object} Template metadata
   */
  async parseLanguageTemplate(languageDir, repository) {
    const bootstrapPath = `${languageDir}/BOOTSTRAP.md`;

    try {
      const bootstrapContent = await this.downloadAgent(repository.url, bootstrapPath, repository.branch);
      const metadata = this.parseBootstrapFile(bootstrapContent);

      return {
        id: `${repository.name}-${languageDir}`,
        name: metadata.name || this.formatTemplateName(languageDir),
        language: this.normalizeLanguageName(languageDir),
        description: metadata.description || `${languageDir} project template`,
        path: languageDir,
        bootstrapPath,
        metadata,
        dependencies: metadata.dependencies || [],
        tools: metadata.tools || [],
        features: metadata.features || []
      };
    } catch (error) {
      throw new Error(`Failed to parse bootstrap file for ${languageDir}: ${error.message}`);
    }
  }

  /**
   * Parse BOOTSTRAP.md file content
   * @param {string} content - Bootstrap file content
   * @returns {Object} Parsed metadata
   */
  parseBootstrapFile(content) {
    const metadata = {
      name: null,
      description: null,
      dependencies: [],
      tools: [],
      features: [],
      steps: [],
      setupCommands: []
    };

    const lines = content.split('\n');
    let currentSection = null;

    for (const line of lines) {
      const trimmed = line.trim();

      // Extract title (first # heading)
      if (trimmed.startsWith('# ') && !metadata.name) {
        metadata.name = trimmed.substring(2).trim();
        continue;
      }

      // Extract description (first paragraph after title)
      if (!metadata.description && trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('-')) {
        metadata.description = trimmed;
        continue;
      }

      // Section headers
      if (trimmed.startsWith('##')) {
        const sectionTitle = trimmed.substring(2).trim().toLowerCase();
        if (sectionTitle.includes('dependencies') || sectionTitle.includes('requirements')) {
          currentSection = 'dependencies';
        } else if (sectionTitle.includes('tools') || sectionTitle.includes('included')) {
          currentSection = 'tools';
        } else if (sectionTitle.includes('features')) {
          currentSection = 'features';
        } else if (sectionTitle.includes('setup') || sectionTitle.includes('installation')) {
          currentSection = 'steps';
        } else {
          currentSection = null;
        }
        continue;
      }

      // Parse list items
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        const item = trimmed.substring(1).trim();
        if (currentSection && metadata[currentSection]) {
          metadata[currentSection].push(item);
        }
        continue;
      }

      // Parse code blocks for setup commands
      if (trimmed.startsWith('```bash') || trimmed.startsWith('```shell')) {
        currentSection = 'setupCommands';
        continue;
      }

      if (trimmed === '```') {
        currentSection = null;
        continue;
      }

      // Add command lines to setup commands
      if (currentSection === 'setupCommands' && trimmed && !trimmed.startsWith('#')) {
        metadata.setupCommands.push(trimmed);
      }
    }

    return metadata;
  }

  /**
   * Get template files from repository
   * @param {Object} template - Template metadata
   * @returns {Array} List of template files
   */
  async getTemplateFiles(template) {
    const repository = template.repository;
    const structure = await this.fetchRepositoryStructure(repository.url, repository.branch);

    // Get all files in the template directory
    const templateFiles = structure[template.path] || [];

    // Filter out non-template files
    const filteredFiles = templateFiles.filter(file =>
      file.type === 'blob' &&
      !file.path.includes('.git') &&
      file.name !== 'BOOTSTRAP.md' &&
      !file.path.includes('docs/')
    );

    return filteredFiles.map(file => ({
      name: file.name,
      path: file.path,
      type: file.type,
      url: `https://raw.githubusercontent.com/${this.parseRepoUrl(repository.url).owner}/${this.parseRepoUrl(repository.url).repo}/${repository.branch}/${file.path}`
    }));
  }

  /**
   * Download template file content
   * @param {Object} template - Template metadata
   * @param {string} filePath - File path within template
   * @returns {string} File content
   */
  async downloadTemplateFile(template, filePath) {
    const repository = template.repository;
    return await this.downloadAgent(repository.url, filePath, repository.branch);
  }

  /**
   * Normalize language directory names to standard format
   * @param {string} langDir - Language directory name
   * @returns {string} Normalized language name
   */
  normalizeLanguageName(langDir) {
    const mapping = {
      'python': 'Python',
      'javascript': 'JavaScript',
      'js': 'JavaScript',
      'typescript': 'TypeScript',
      'ts': 'TypeScript',
      'rust': 'Rust',
      'go': 'Go',
      'java': 'Java',
      'csharp': 'C#',
      'cpp': 'C++',
      'c': 'C',
      'php': 'PHP',
      'ruby': 'Ruby',
      'swift': 'Swift',
      'kotlin': 'Kotlin'
    };

    return mapping[langDir.toLowerCase()] || langDir.charAt(0).toUpperCase() + langDir.slice(1);
  }

  /**
   * Format template name from directory name
   * @param {string} langDir - Language directory name
   * @returns {string} Formatted template name
   */
  formatTemplateName(langDir) {
    const language = this.normalizeLanguageName(langDir);
    return `${language} Template`;
  }

  /**
   * Validate template structure
   * @param {Object} template - Template to validate
   * @returns {Object} Validation result
   */
  validateTemplate(template) {
    const errors = [];

    if (!template.name) {
      errors.push('Template name is required');
    }

    if (!template.language) {
      errors.push('Template language is required');
    }

    if (!template.path) {
      errors.push('Template path is required');
    }

    if (!template.bootstrapPath) {
      errors.push('Bootstrap path is required');
    }

    if (!template.repository) {
      errors.push('Template repository reference is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Search templates by query
   * @param {Object} templates - All templates grouped by language
   * @param {string} query - Search query
   * @returns {Array} Matching templates
   */
  searchTemplates(templates, query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    Object.values(templates).forEach(languageTemplates => {
      languageTemplates.forEach(template => {
        if (
          template.name.toLowerCase().includes(lowerQuery) ||
          template.description.toLowerCase().includes(lowerQuery) ||
          template.language.toLowerCase().includes(lowerQuery) ||
          template.features.some(feature => feature.toLowerCase().includes(lowerQuery))
        ) {
          results.push(template);
        }
      });
    });

    return results;
  }

  /**
   * Generate GitHub raw URL for template's BOOTSTRAP.md file
   * @param {Object} template - Template metadata
   * @returns {string} Direct URL to BOOTSTRAP.md file
   */
  getTemplateUrl(template) {
    const repository = template.repository;
    const { owner, repo } = this.parseRepoUrl(repository.url);
    const branch = repository.branch || 'main';
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${template.path}/BOOTSTRAP.md`;
  }

  /**
   * Get template information suitable for Claude Code CLI
   * @param {Object} template - Template metadata
   * @returns {Object} Template info for Claude integration
   */
  getTemplateForClaude(template) {
    return {
      name: template.name,
      language: template.language,
      description: template.description,
      url: this.getTemplateUrl(template),
      features: template.features || [],
      dependencies: template.dependencies || [],
      tools: template.tools || []
    };
  }
}

module.exports = { TemplateRepository };
