const { REPOSITORY_TYPES, getRepositoriesByType, getDefaultRepository, validateRepository } = require('./utils');

class RepositoryManager {
  constructor(repositories = []) {
    this.repositories = repositories;
  }

  /**
   * Get repositories filtered by type
   * @param {string} type - Repository type (agents, templates, mixed)
   * @returns {Array} Filtered repositories
   */
  getByType(type) {
    return getRepositoriesByType(this.repositories, type);
  }

  /**
   * Get default repository for a specific type
   * @param {string} type - Repository type
   * @returns {Object|null} Default repository or null if not found
   */
  getDefault(type) {
    return getDefaultRepository(this.repositories, type);
  }

  /**
   * Get all enabled repositories
   * @returns {Array} All enabled repositories
   */
  getEnabled() {
    return this.repositories.filter(repo => repo.enabled !== false);
  }

  /**
   * Add a new repository
   * @param {Object} repository - Repository configuration
   * @returns {Object} Validation result
   */
  add(repository) {
    const validation = validateRepository(repository);
    if (!validation.isValid) {
      return validation;
    }

    // Check for duplicate names
    const existingRepo = this.repositories.find(repo => repo.name === repository.name);
    if (existingRepo) {
      return {
        isValid: false,
        errors: ['Repository name already exists']
      };
    }

    // Set as default if it's the first repository of this type
    const sameTypeRepos = this.getByType(repository.type);
    if (sameTypeRepos.length === 0) {
      repository.default = true;
    }

    // Ensure enabled flag is set
    if (repository.enabled === undefined) {
      repository.enabled = true;
    }

    this.repositories.push(repository);

    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * Update an existing repository
   * @param {number} index - Repository index
   * @param {Object} updates - Updated repository data
   * @returns {Object} Validation result
   */
  update(index, updates) {
    if (index < 0 || index >= this.repositories.length) {
      return {
        isValid: false,
        errors: ['Invalid repository index']
      };
    }

    const updatedRepo = { ...this.repositories[index], ...updates };
    const validation = validateRepository(updatedRepo);
    if (!validation.isValid) {
      return validation;
    }

    // Check for duplicate names (excluding current repo)
    const existingRepo = this.repositories.find((repo, i) =>
      i !== index && repo.name === updatedRepo.name
    );
    if (existingRepo) {
      return {
        isValid: false,
        errors: ['Repository name already exists']
      };
    }

    this.repositories[index] = updatedRepo;

    return {
      isValid: true,
      errors: []
    };
  }

  /**
   * Remove a repository
   * @param {number} index - Repository index
   * @returns {Object} Result of removal operation
   */
  remove(index) {
    if (index < 0 || index >= this.repositories.length) {
      return {
        isValid: false,
        errors: ['Invalid repository index']
      };
    }

    const repo = this.repositories[index];
    this.repositories.splice(index, 1);

    // If this was the default repository, set a new default
    if (repo.default) {
      const sameTypeRepos = this.getByType(repo.type);
      if (sameTypeRepos.length > 0) {
        sameTypeRepos[0].default = true;
      }
    }

    return {
      isValid: true,
      removedRepository: repo
    };
  }

  /**
   * Set a repository as default for its type
   * @param {number} index - Repository index
   * @returns {Object} Result of operation
   */
  setDefault(index) {
    if (index < 0 || index >= this.repositories.length) {
      return {
        isValid: false,
        errors: ['Invalid repository index']
      };
    }

    const repo = this.repositories[index];

    // Remove default flag from other repositories of the same type
    this.repositories.forEach(r => {
      if (r.type === repo.type) {
        r.default = false;
      }
    });

    // Set this repository as default
    repo.default = true;

    return {
      isValid: true,
      defaultRepository: repo
    };
  }

  /**
   * Toggle repository enabled/disabled status
   * @param {number} index - Repository index
   * @returns {Object} Result of operation
   */
  toggle(index) {
    if (index < 0 || index >= this.repositories.length) {
      return {
        isValid: false,
        errors: ['Invalid repository index']
      };
    }

    const repo = this.repositories[index];
    repo.enabled = !repo.enabled;

    // If we disabled the default repository, find a new default
    if (!repo.enabled && repo.default) {
      const enabledSameType = this.repositories.filter(r =>
        r.type === repo.type && r.enabled && r !== repo
      );

      if (enabledSameType.length > 0) {
        enabledSameType[0].default = true;
      }

      repo.default = false;
    }

    return {
      isValid: true,
      repository: repo
    };
  }

  /**
   * Get repositories grouped by type
   * @returns {Object} Repositories grouped by type
   */
  getGroupedByType() {
    const grouped = {};

    Object.values(REPOSITORY_TYPES).forEach(type => {
      grouped[type] = this.getByType(type);
    });

    return grouped;
  }

  /**
   * Get repository statistics
   * @returns {Object} Statistics about repositories
   */
  getStats() {
    const stats = {
      total: this.repositories.length,
      enabled: this.getEnabled().length,
      byType: {}
    };

    Object.values(REPOSITORY_TYPES).forEach(type => {
      const allTypeRepos = this.repositories.filter(repo => repo.type === type);
      const enabledTypeRepos = this.getByType(type);
      stats.byType[type] = {
        total: allTypeRepos.length,
        enabled: enabledTypeRepos.length,
        default: this.getDefault(type)?.name || 'None'
      };
    });

    return stats;
  }

  /**
   * Validate all repositories
   * @returns {Array} Array of validation results
   */
  validateAll() {
    return this.repositories.map((repo, index) => ({
      index,
      name: repo.name,
      ...validateRepository(repo)
    }));
  }

  /**
   * Search repositories by name or description
   * @param {string} query - Search query
   * @returns {Array} Matching repositories
   */
  search(query) {
    const lowerQuery = query.toLowerCase();
    return this.repositories.filter(repo =>
      repo.name.toLowerCase().includes(lowerQuery) ||
      (repo.description && repo.description.toLowerCase().includes(lowerQuery))
    );
  }
}

module.exports = { RepositoryManager };
