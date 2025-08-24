const {
  migrateConfig,
  getRepositoriesByType,
  getDefaultRepository,
  validateRepositoryType,
  REPOSITORY_TYPES
} = require('../src/utils');

describe('Extended Utils Functions', () => {
  describe('REPOSITORY_TYPES', () => {
    test('should export repository type constants', () => {
      expect(REPOSITORY_TYPES.AGENTS).toBe('agents');
      expect(REPOSITORY_TYPES.TEMPLATES).toBe('templates');
      expect(REPOSITORY_TYPES.MIXED).toBe('mixed');
    });
  });

  describe('migrateConfig', () => {
    test('should migrate repositories to include type field', async () => {
      const oldConfig = {
        repositories: [
          {
            name: 'Old Repo',
            url: 'https://github.com/example/repo',
            branch: 'main',
            default: true
          }
        ],
        preferences: {
          showDescriptions: true
        }
      };

      const migratedConfig = await migrateConfig(oldConfig);

      expect(migratedConfig.repositories[0]).toMatchObject({
        name: 'Old Repo',
        url: 'https://github.com/example/repo',
        branch: 'main',
        type: REPOSITORY_TYPES.AGENTS,
        description: 'Legacy repository',
        enabled: true,
        default: true
      });
    });

    test('should add missing preferences', async () => {
      const oldConfig = {
        repositories: [],
        preferences: {
          showDescriptions: true
        }
      };

      const migratedConfig = await migrateConfig(oldConfig);

      expect(migratedConfig.preferences).toMatchObject({
        showDescriptions: true,
        confirmBeforeBootstrap: true,
        autoInstallDependencies: true,
        autoInitGit: true
      });
    });

    test('should migrate old templateRepositories field', async () => {
      const oldConfig = {
        repositories: [
          {
            name: 'Agent Repo',
            type: REPOSITORY_TYPES.AGENTS,
            url: 'https://github.com/example/agents',
            branch: 'main'
          }
        ],
        templateRepositories: [
          {
            name: 'Template Repo',
            url: 'https://github.com/example/templates',
            branch: 'main'
          }
        ],
        preferences: {}
      };

      const migratedConfig = await migrateConfig(oldConfig);

      expect(migratedConfig.repositories).toHaveLength(2);
      expect(migratedConfig.repositories[1]).toMatchObject({
        name: 'Template Repo',
        type: REPOSITORY_TYPES.TEMPLATES,
        enabled: true
      });
      expect(migratedConfig.templateRepositories).toBeUndefined();
    });

    test('should not change already migrated config', async () => {
      const newConfig = {
        repositories: [
          {
            name: 'Modern Repo',
            type: REPOSITORY_TYPES.TEMPLATES,
            url: 'https://github.com/example/templates',
            branch: 'main',
            enabled: true
          }
        ],
        preferences: {
          confirmBeforeBootstrap: true,
          autoInstallDependencies: true,
          autoInitGit: true
        }
      };

      const result = await migrateConfig(newConfig);

      // Should return the same object since no changes were needed
      expect(result).toBe(newConfig);
    });
  });

  describe('getRepositoriesByType', () => {
    const repositories = [
      {
        name: 'Agent Repo 1',
        type: REPOSITORY_TYPES.AGENTS,
        enabled: true
      },
      {
        name: 'Agent Repo 2',
        type: REPOSITORY_TYPES.AGENTS,
        enabled: false
      },
      {
        name: 'Template Repo 1',
        type: REPOSITORY_TYPES.TEMPLATES,
        enabled: true
      },
      {
        name: 'Mixed Repo',
        type: REPOSITORY_TYPES.MIXED
      }
    ];

    test('should filter repositories by type', () => {
      const agentRepos = getRepositoriesByType(repositories, REPOSITORY_TYPES.AGENTS);
      expect(agentRepos).toHaveLength(1); // Only enabled one
      expect(agentRepos[0].name).toBe('Agent Repo 1');

      const templateRepos = getRepositoriesByType(repositories, REPOSITORY_TYPES.TEMPLATES);
      expect(templateRepos).toHaveLength(1);
      expect(templateRepos[0].name).toBe('Template Repo 1');
    });

    test('should exclude disabled repositories', () => {
      const agentRepos = getRepositoriesByType(repositories, REPOSITORY_TYPES.AGENTS);
      expect(agentRepos.find(repo => repo.name === 'Agent Repo 2')).toBeUndefined();
    });

    test('should include repositories with undefined enabled field', () => {
      const mixedRepos = getRepositoriesByType(repositories, REPOSITORY_TYPES.MIXED);
      expect(mixedRepos).toHaveLength(1);
      expect(mixedRepos[0].name).toBe('Mixed Repo');
    });
  });

  describe('getDefaultRepository', () => {
    const repositories = [
      {
        name: 'Agent Repo 1',
        type: REPOSITORY_TYPES.AGENTS,
        default: false,
        enabled: true
      },
      {
        name: 'Agent Repo 2',
        type: REPOSITORY_TYPES.AGENTS,
        default: true,
        enabled: true
      },
      {
        name: 'Template Repo',
        type: REPOSITORY_TYPES.TEMPLATES,
        default: true,
        enabled: false
      }
    ];

    test('should return default enabled repository for type', () => {
      const defaultAgent = getDefaultRepository(repositories, REPOSITORY_TYPES.AGENTS);
      expect(defaultAgent.name).toBe('Agent Repo 2');
    });

    test('should return null if default repository is disabled', () => {
      const defaultTemplate = getDefaultRepository(repositories, REPOSITORY_TYPES.TEMPLATES);
      expect(defaultTemplate).toBeNull();
    });

    test('should return null if no default repository for type', () => {
      const defaultMixed = getDefaultRepository(repositories, REPOSITORY_TYPES.MIXED);
      expect(defaultMixed).toBeNull();
    });
  });

  describe('validateRepositoryType', () => {
    test('should validate valid repository types', () => {
      expect(validateRepositoryType(REPOSITORY_TYPES.AGENTS)).toBe(true);
      expect(validateRepositoryType(REPOSITORY_TYPES.TEMPLATES)).toBe(true);
      expect(validateRepositoryType(REPOSITORY_TYPES.MIXED)).toBe(true);
    });

    test('should reject invalid repository types', () => {
      expect(validateRepositoryType('invalid')).toBe(false);
      expect(validateRepositoryType('AGENTS')).toBe(false); // Case sensitive
      expect(validateRepositoryType('')).toBe(false);
      expect(validateRepositoryType(null)).toBe(false);
      expect(validateRepositoryType(undefined)).toBe(false);
    });
  });
});
