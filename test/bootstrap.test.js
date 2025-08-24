const { bootstrap } = require('../src/bootstrap');

// Mock dependencies
jest.mock('../src/repository-manager');
jest.mock('../src/template-repository');
jest.mock('../src/template-bootstrapper');
jest.mock('../src/utils');

// Mock ora spinner
const mockSpinner = {
  start: jest.fn().mockReturnThis(),
  succeed: jest.fn().mockReturnThis(),
  fail: jest.fn().mockReturnThis(),
  stop: jest.fn().mockReturnThis()
};
jest.mock('ora', () => jest.fn(() => mockSpinner));

const { RepositoryManager } = require('../src/repository-manager');
const { TemplateRepository } = require('../src/template-repository');
const { TemplateBootstrapper } = require('../src/template-bootstrapper');
const { loadConfig } = require('../src/utils');

describe('bootstrap', () => {
  let mockConfig;
  let mockRepoManager;
  let mockTemplateRepo;
  let mockBootstrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSpinner.start.mockClear();
    mockSpinner.succeed.mockClear();
    mockSpinner.fail.mockClear();
    mockSpinner.stop.mockClear();

    // Mock process.exit to prevent test termination
    jest.spyOn(process, 'exit').mockImplementation(() => {});

    mockConfig = {
      repositories: [
        {
          name: 'Vibe Templates',
          type: 'templates',
          url: 'https://github.com/chrishayuk/vibe-coding-templates',
          branch: 'main',
          enabled: true
        }
      ]
    };

    mockRepoManager = {
      getByType: jest.fn().mockReturnValue([mockConfig.repositories[0]])
    };

    mockTemplateRepo = {
      discoverTemplates: jest.fn().mockResolvedValue({
        Python: [
          {
            name: 'Python Basic Template',
            language: 'Python',
            description: 'A basic Python project template',
            id: 'vibe-templates-python',
            metadata: {
              features: ['FastAPI', 'pytest', 'ruff']
            },
            repository: mockConfig.repositories[0]
          }
        ],
        JavaScript: [
          {
            name: 'React Template',
            language: 'JavaScript',
            description: 'Modern React application',
            id: 'vibe-templates-javascript',
            metadata: {
              features: ['React', 'Vite', 'TypeScript']
            },
            repository: mockConfig.repositories[0]
          }
        ]
      })
    };

    mockBootstrapper = {
      initializeProject: jest.fn().mockResolvedValue({
        success: true,
        steps: [
          '✓ Validated project path',
          '✓ Created project directory',
          '✓ Downloaded template files',
          '✓ Processed variables',
          '✓ Installed dependencies'
        ],
        projectPath: '/tmp/test-project',
        errors: []
      }),
      getNextSteps: jest.fn().mockReturnValue([
        'cd test-project',
        'source .venv/bin/activate',
        'python main.py'
      ])
    };

    loadConfig.mockResolvedValue(mockConfig);
    RepositoryManager.mockImplementation(() => mockRepoManager);
    TemplateRepository.mockImplementation(() => mockTemplateRepo);
    TemplateBootstrapper.mockImplementation(() => mockBootstrapper);

    // Mock console methods to avoid test output pollution
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
    process.exit.mockRestore();
  });

  describe('listTemplates option', () => {
    test('should list all available templates', async () => {
      await bootstrap({ listTemplates: true });

      expect(mockTemplateRepo.discoverTemplates).toHaveBeenCalledWith([mockConfig.repositories[0]]);
      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('Available Templates'));
    });

    test('should handle no template repositories configured', async () => {
      mockRepoManager.getByType.mockReturnValue([]);

      await bootstrap({ listTemplates: true });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No template repositories configured'));
    });

    test('should handle no templates found', async () => {
      mockTemplateRepo.discoverTemplates.mockResolvedValue({});

      await bootstrap({ listTemplates: true });

      expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No templates found'));
    });
  });

  describe('direct template specification', () => {
    test('should bootstrap with specified template name', async () => {
      const options = {
        template: 'python',
        name: 'my-python-app',
        path: '/tmp'
      };

      await bootstrap(options);

      expect(mockBootstrapper.initializeProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Python Basic Template',
          language: 'Python'
        }),
        'my-python-app',
        '/tmp',
        expect.objectContaining({
          dryRun: false,
          verbose: false,
          autoInstall: true,
          initGit: true
        })
      );
    });

    test('should handle template not found', async () => {
      const options = {
        template: 'nonexistent-template'
      };

      await bootstrap(options);

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Template "nonexistent-template" not found.')
      );
    });

    test('should find template by language name', async () => {
      const options = {
        template: 'JavaScript',
        name: 'my-react-app'
      };

      await bootstrap(options);

      expect(mockBootstrapper.initializeProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'React Template',
          language: 'JavaScript'
        }),
        'my-react-app',
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('interactive mode', () => {
    test('should handle interactive template selection', async () => {
      await bootstrap({});

      expect(mockTemplateRepo.discoverTemplates).toHaveBeenCalled();
      expect(mockBootstrapper.initializeProject).toHaveBeenCalled();
    });

    test('should use first template when multiple available', async () => {
      await bootstrap({});

      expect(mockBootstrapper.initializeProject).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Python Basic Template'
        }),
        expect.any(String),
        expect.any(String),
        expect.any(Object)
      );
    });
  });

  describe('error handling', () => {
    test('should handle network errors gracefully', async () => {
      mockTemplateRepo.discoverTemplates.mockRejectedValue({
        code: 'ENOTFOUND',
        message: 'Network error'
      });

      await bootstrap({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Network error')
      );
    });

    test('should handle general bootstrap errors', async () => {
      mockBootstrapper.initializeProject.mockRejectedValue(
        new Error('Bootstrap failed')
      );

      await bootstrap({ template: 'python' });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Bootstrap failed with error')
      );
    });

    test('should handle template discovery errors', async () => {
      mockTemplateRepo.discoverTemplates.mockRejectedValue(
        new Error('Failed to fetch templates')
      );

      await bootstrap({});

      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('Bootstrap Error:'),
        'Failed to fetch templates'
      );
    });
  });

  describe('dry run mode', () => {
    test('should execute in dry run mode', async () => {
      await bootstrap({
        template: 'python',
        name: 'test-project',
        dryRun: true
      });

      expect(mockBootstrapper.initializeProject).toHaveBeenCalledWith(
        expect.any(Object),
        'test-project',
        expect.any(String),
        expect.objectContaining({
          dryRun: true
        })
      );
    });
  });

  describe('verbose mode', () => {
    test('should execute in verbose mode', async () => {
      await bootstrap({
        template: 'python',
        verbose: true
      });

      expect(mockBootstrapper.initializeProject).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          verbose: true
        })
      );
    });
  });

  describe('success scenarios', () => {
    test('should display success message and next steps', async () => {
      await bootstrap({ template: 'python' });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Bootstrap completed successfully')
      );
    });

    test('should handle bootstrap failures', async () => {
      mockBootstrapper.initializeProject.mockResolvedValue({
        success: false,
        errors: ['Permission denied', 'Invalid template'],
        steps: [],
        projectPath: null
      });

      await bootstrap({ template: 'python' });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('Bootstrap failed')
      );
    });
  });

  describe('configuration edge cases', () => {
    test('should handle no template repositories configured', async () => {
      mockRepoManager.getByType.mockReturnValue([]);

      await bootstrap({});

      expect(mockSpinner.fail).toHaveBeenCalledWith('No template repositories configured');
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('claude-wizard configure')
      );
    });

    test('should handle empty templates discovery', async () => {
      mockTemplateRepo.discoverTemplates.mockResolvedValue({});

      await bootstrap({});

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining('No templates found')
      );
    });
  });
});
