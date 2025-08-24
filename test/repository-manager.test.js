const { RepositoryManager } = require('../src/repository-manager');
const { REPOSITORY_TYPES } = require('../src/utils');

describe('RepositoryManager', () => {
  let manager;
  let sampleRepositories;

  beforeEach(() => {
    sampleRepositories = [
      {
        name: 'Default Agents',
        url: 'https://github.com/example/agents',
        branch: 'main',
        type: REPOSITORY_TYPES.AGENTS,
        description: 'Default agent repository',
        default: true,
        enabled: true
      },
      {
        name: 'Custom Agents',
        url: 'https://github.com/custom/agents',
        branch: 'develop',
        type: REPOSITORY_TYPES.AGENTS,
        description: 'Custom agent repository',
        default: false,
        enabled: true
      },
      {
        name: 'Vibe Templates',
        url: 'https://github.com/chrishayuk/vibe-coding-templates',
        branch: 'main',
        type: REPOSITORY_TYPES.TEMPLATES,
        description: 'AI-optimized templates',
        default: true,
        enabled: true
      },
      {
        name: 'Disabled Templates',
        url: 'https://github.com/example/disabled-templates',
        branch: 'main',
        type: REPOSITORY_TYPES.TEMPLATES,
        description: 'Disabled template repository',
        default: false,
        enabled: false
      }
    ];

    manager = new RepositoryManager([...sampleRepositories]);
  });

  describe('getByType', () => {
    test('should return repositories of specified type', () => {
      const agentRepos = manager.getByType(REPOSITORY_TYPES.AGENTS);
      expect(agentRepos).toHaveLength(2);
      expect(agentRepos.every(repo => repo.type === REPOSITORY_TYPES.AGENTS)).toBe(true);
    });

    test('should filter out disabled repositories', () => {
      const templateRepos = manager.getByType(REPOSITORY_TYPES.TEMPLATES);
      expect(templateRepos).toHaveLength(1); // Should exclude disabled one
      expect(templateRepos[0].name).toBe('Vibe Templates');
    });

    test('should return empty array for non-existent type', () => {
      const mixedRepos = manager.getByType(REPOSITORY_TYPES.MIXED);
      expect(mixedRepos).toHaveLength(0);
    });
  });

  describe('getDefault', () => {
    test('should return default repository for type', () => {
      const defaultAgent = manager.getDefault(REPOSITORY_TYPES.AGENTS);
      expect(defaultAgent.name).toBe('Default Agents');
      expect(defaultAgent.default).toBe(true);

      const defaultTemplate = manager.getDefault(REPOSITORY_TYPES.TEMPLATES);
      expect(defaultTemplate.name).toBe('Vibe Templates');
      expect(defaultTemplate.default).toBe(true);
    });

    test('should return null if no default for type', () => {
      const defaultMixed = manager.getDefault(REPOSITORY_TYPES.MIXED);
      expect(defaultMixed).toBe(null);
    });
  });

  describe('getEnabled', () => {
    test('should return only enabled repositories', () => {
      const enabled = manager.getEnabled();
      expect(enabled).toHaveLength(3); // Should exclude the disabled one
      expect(enabled.every(repo => repo.enabled !== false)).toBe(true);
    });
  });

  describe('add', () => {
    test('should add valid repository', () => {
      const newRepo = {
        name: 'New Templates',
        url: 'https://github.com/example/new-templates',
        branch: 'main',
        type: REPOSITORY_TYPES.TEMPLATES,
        description: 'New template repository'
      };

      const result = manager.add(newRepo);
      expect(result.isValid).toBe(true);
      expect(manager.repositories).toHaveLength(5);

      // Should not be default since there's already a default template repo
      expect(newRepo.default).toBeFalsy();
    });

    test('should set as default if first of type', () => {
      const newMixedRepo = {
        name: 'Mixed Repo',
        url: 'https://github.com/example/mixed',
        branch: 'main',
        type: REPOSITORY_TYPES.MIXED,
        description: 'Mixed repository'
      };

      const result = manager.add(newMixedRepo);
      expect(result.isValid).toBe(true);
      expect(newMixedRepo.default).toBe(true);
    });

    test('should reject repository with duplicate name', () => {
      const duplicateRepo = {
        name: 'Default Agents',
        url: 'https://github.com/example/duplicate',
        branch: 'main',
        type: REPOSITORY_TYPES.AGENTS,
        description: 'Duplicate name'
      };

      const result = manager.add(duplicateRepo);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Repository name already exists');
    });

    test('should reject repository with invalid data', () => {
      const invalidRepo = {
        name: '',
        url: 'invalid-url',
        branch: '',
        type: 'invalid-type'
      };

      const result = manager.add(invalidRepo);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    test('should update repository at valid index', () => {
      const updates = {
        description: 'Updated description',
        branch: 'updated-branch'
      };

      const result = manager.update(0, updates);
      expect(result.isValid).toBe(true);
      expect(manager.repositories[0].description).toBe('Updated description');
      expect(manager.repositories[0].branch).toBe('updated-branch');
    });

    test('should reject update with invalid index', () => {
      const result = manager.update(999, { description: 'test' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid repository index');
    });

    test('should reject update that creates duplicate name', () => {
      const result = manager.update(1, { name: 'Default Agents' });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Repository name already exists');
    });
  });

  describe('remove', () => {
    test('should remove repository at valid index', () => {
      const result = manager.remove(1);
      expect(result.isValid).toBe(true);
      expect(result.removedRepository.name).toBe('Custom Agents');
      expect(manager.repositories).toHaveLength(3);
    });

    test('should set new default when removing default repository', () => {
      // Remove default agent repository
      const result = manager.remove(0);
      expect(result.isValid).toBe(true);

      // Custom Agents should become the new default
      const newDefault = manager.getDefault(REPOSITORY_TYPES.AGENTS);
      expect(newDefault.name).toBe('Custom Agents');
      expect(newDefault.default).toBe(true);
    });

    test('should reject removal with invalid index', () => {
      const result = manager.remove(999);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid repository index');
    });
  });

  describe('setDefault', () => {
    test('should set repository as default for its type', () => {
      const result = manager.setDefault(1); // Custom Agents
      expect(result.isValid).toBe(true);

      // Custom Agents should be default now
      expect(manager.repositories[1].default).toBe(true);
      // Default Agents should no longer be default
      expect(manager.repositories[0].default).toBe(false);
    });

    test('should reject invalid index', () => {
      const result = manager.setDefault(999);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid repository index');
    });
  });

  describe('toggle', () => {
    test('should toggle repository enabled status', () => {
      const result = manager.toggle(0);
      expect(result.isValid).toBe(true);
      expect(manager.repositories[0].enabled).toBe(false);

      // Toggle back
      const result2 = manager.toggle(0);
      expect(result2.isValid).toBe(true);
      expect(manager.repositories[0].enabled).toBe(true);
    });

    test('should find new default when disabling default repository', () => {
      const result = manager.toggle(0); // Disable default agents repo
      expect(result.isValid).toBe(true);
      expect(manager.repositories[0].enabled).toBe(false);
      expect(manager.repositories[0].default).toBe(false);

      // Custom Agents should become default
      const newDefault = manager.getDefault(REPOSITORY_TYPES.AGENTS);
      expect(newDefault.name).toBe('Custom Agents');
    });
  });

  describe('getGroupedByType', () => {
    test('should return repositories grouped by type', () => {
      const grouped = manager.getGroupedByType();

      expect(grouped[REPOSITORY_TYPES.AGENTS]).toHaveLength(2);
      expect(grouped[REPOSITORY_TYPES.TEMPLATES]).toHaveLength(1);
      expect(grouped[REPOSITORY_TYPES.MIXED]).toHaveLength(0);
    });
  });

  describe('getStats', () => {
    test('should return repository statistics', () => {
      const stats = manager.getStats();

      expect(stats.total).toBe(4);
      expect(stats.enabled).toBe(3);
      expect(stats.byType[REPOSITORY_TYPES.AGENTS].total).toBe(2);
      expect(stats.byType[REPOSITORY_TYPES.AGENTS].enabled).toBe(2);
      expect(stats.byType[REPOSITORY_TYPES.TEMPLATES].total).toBe(2);
      expect(stats.byType[REPOSITORY_TYPES.TEMPLATES].enabled).toBe(1);
      expect(stats.byType[REPOSITORY_TYPES.AGENTS].default).toBe('Default Agents');
    });
  });

  describe('validateAll', () => {
    test('should validate all repositories', () => {
      const results = manager.validateAll();
      expect(results).toHaveLength(4);
      expect(results.every(result => result.isValid)).toBe(true);
    });
  });

  describe('search', () => {
    test('should find repositories by name', () => {
      const results = manager.search('Default');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Default Agents');
    });

    test('should find repositories by description', () => {
      const results = manager.search('AI-optimized');
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Vibe Templates');
    });

    test('should return empty array for no matches', () => {
      const results = manager.search('nonexistent');
      expect(results).toHaveLength(0);
    });
  });
});
