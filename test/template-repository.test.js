const { TemplateRepository } = require('../src/template-repository');
const { REPOSITORY_TYPES } = require('../src/utils');

// Mock the GitHubAPI class methods
const mockFetchRepositoryStructure = jest.fn();
const mockDownloadAgent = jest.fn();
const mockParseRepoUrl = jest.fn().mockReturnValue({ owner: 'test', repo: 'test' });

jest.mock('../src/github', () => ({
  GitHubAPI: class MockGitHubAPI {
    constructor() {
      this.fetchRepositoryStructure = mockFetchRepositoryStructure;
      this.downloadAgent = mockDownloadAgent;
      this.parseRepoUrl = mockParseRepoUrl;
    }
  }
}));

describe('TemplateRepository', () => {
  let templateRepo;
  let mockGithubMethods;

  beforeEach(() => {
    jest.clearAllMocks();
    templateRepo = new TemplateRepository();

    // Mock the template-specific methods
    templateRepo.fetchTemplateRepositoryStructure = mockFetchRepositoryStructure;

    mockGithubMethods = {
      fetchRepositoryStructure: mockFetchRepositoryStructure,
      downloadAgent: mockDownloadAgent
    };
  });

  describe('discoverTemplates', () => {
    test('should discover templates from multiple repositories', async () => {
      const repositories = [
        {
          name: 'Vibe Templates',
          url: 'https://github.com/chrishayuk/vibe-coding-templates',
          branch: 'main',
          type: REPOSITORY_TYPES.TEMPLATES,
          enabled: true
        },
        {
          name: 'Custom Templates',
          url: 'https://github.com/custom/templates',
          branch: 'main',
          type: REPOSITORY_TYPES.TEMPLATES,
          enabled: true
        },
        {
          name: 'Disabled Templates',
          url: 'https://github.com/disabled/templates',
          branch: 'main',
          type: REPOSITORY_TYPES.TEMPLATES,
          enabled: false
        }
      ];

      // Mock repository structure
      mockGithubMethods.fetchRepositoryStructure.mockResolvedValue({
        'python': [{ name: 'BOOTSTRAP.md', type: 'blob' }],
        'javascript': [{ name: 'BOOTSTRAP.md', type: 'blob' }]
      });

      // Mock bootstrap file content
      mockGithubMethods.downloadAgent.mockResolvedValue(`
# Python Basic Template
A basic Python project template with modern tooling.

## Features
- FastAPI framework
- pytest for testing
- ruff for linting

## Setup
\`\`\`bash
uv sync
pytest
\`\`\`
      `);

      const templates = await templateRepo.discoverTemplates(repositories);

      // Should only process enabled repositories
      expect(templateRepo.fetchTemplateRepositoryStructure).toHaveBeenCalledTimes(2);
      expect(templates).toHaveProperty('Python');
      expect(templates).toHaveProperty('JavaScript');
    });

    test('should return empty object when no template repositories', async () => {
      const repositories = [
        {
          name: 'Agent Repo',
          type: REPOSITORY_TYPES.AGENTS,
          enabled: true
        }
      ];

      const templates = await templateRepo.discoverTemplates(repositories);
      expect(templates).toEqual({});
    });

    test('should handle repository fetch failures gracefully', async () => {
      const repositories = [
        {
          name: 'Failing Repo',
          url: 'https://github.com/fail/repo',
          branch: 'main',
          type: REPOSITORY_TYPES.TEMPLATES,
          enabled: true
        }
      ];

      mockGithubMethods.fetchRepositoryStructure.mockRejectedValue(new Error('Network error'));

      // Should not throw, but return empty templates
      const templates = await templateRepo.discoverTemplates(repositories);
      expect(templates).toEqual({});
    });
  });

  describe('parseVibeTemplateStructure', () => {
    test('should parse vibe-coding-templates structure', async () => {
      const structure = {
        'python': [
          { name: 'BOOTSTRAP.md', type: 'blob' },
          { name: 'templates', type: 'tree' }
        ],
        'javascript': [
          { name: 'BOOTSTRAP.md', type: 'blob' },
          { name: 'package.json', type: 'blob' }
        ],
        'docs': [
          { name: 'README.md', type: 'blob' }
        ]
      };

      const repository = {
        name: 'Test Repo',
        url: 'https://github.com/test/repo',
        branch: 'main'
      };

      mockGithubMethods.downloadAgent.mockResolvedValue(`
# Python Project Template
A modern Python project template.

## Dependencies
- FastAPI
- pytest
- ruff

## Features
- Modern Python tooling
- API development ready
      `);

      const templates = await templateRepo.parseVibeTemplateStructure(structure, repository);

      expect(templates).toHaveProperty('Python');
      expect(templates).toHaveProperty('JavaScript');
      expect(templates).not.toHaveProperty('Docs'); // Should ignore non-template dirs

      const pythonTemplate = templates.Python[0];
      expect(pythonTemplate.name).toBe('Python Project Template');
      expect(pythonTemplate.language).toBe('Python');
      expect(pythonTemplate.dependencies).toContain('FastAPI');
      expect(pythonTemplate.features).toContain('Modern Python tooling');
    });
  });

  describe('parseBootstrapFile', () => {
    test('should parse bootstrap file metadata', () => {
      const content = `
# React TypeScript Template
A modern React application with TypeScript and Vite.

## Features
- React 18 with hooks
- TypeScript for type safety
- Vite for fast development
- Tailwind CSS for styling

## Dependencies
- React
- TypeScript
- Vite
- Tailwind CSS

## Setup Commands
\`\`\`bash
npm install
npm run dev
npm run test
\`\`\`

## Getting Started
Run the development server to get started.
      `;

      const metadata = templateRepo.parseBootstrapFile(content);

      expect(metadata.name).toBe('React TypeScript Template');
      expect(metadata.description).toBe('A modern React application with TypeScript and Vite.');
      expect(metadata.features).toContain('React 18 with hooks');
      expect(metadata.features).toContain('TypeScript for type safety');
      expect(metadata.dependencies).toContain('React');
      expect(metadata.dependencies).toContain('TypeScript');
      expect(metadata.setupCommands).toContain('npm install');
      expect(metadata.setupCommands).toContain('npm run dev');
    });

    test('should handle bootstrap file without sections', () => {
      const content = `
# Simple Template
Just a simple template.
      `;

      const metadata = templateRepo.parseBootstrapFile(content);

      expect(metadata.name).toBe('Simple Template');
      expect(metadata.description).toBe('Just a simple template.');
      expect(metadata.features).toHaveLength(0);
      expect(metadata.dependencies).toHaveLength(0);
      expect(metadata.setupCommands).toHaveLength(0);
    });
  });

  describe('normalizeLanguageName', () => {
    test('should normalize common language names', () => {
      expect(templateRepo.normalizeLanguageName('python')).toBe('Python');
      expect(templateRepo.normalizeLanguageName('javascript')).toBe('JavaScript');
      expect(templateRepo.normalizeLanguageName('js')).toBe('JavaScript');
      expect(templateRepo.normalizeLanguageName('typescript')).toBe('TypeScript');
      expect(templateRepo.normalizeLanguageName('ts')).toBe('TypeScript');
      expect(templateRepo.normalizeLanguageName('rust')).toBe('Rust');
      expect(templateRepo.normalizeLanguageName('go')).toBe('Go');
    });

    test('should handle unknown language names', () => {
      expect(templateRepo.normalizeLanguageName('kotlin')).toBe('Kotlin');
      expect(templateRepo.normalizeLanguageName('unknown')).toBe('Unknown');
    });
  });

  describe('validateTemplate', () => {
    test('should validate complete template', () => {
      const validTemplate = {
        name: 'Test Template',
        language: 'Python',
        path: 'python',
        bootstrapPath: 'python/BOOTSTRAP.md',
        repository: { name: 'Test Repo' }
      };

      const result = templateRepo.validateTemplate(validTemplate);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should identify missing required fields', () => {
      const invalidTemplate = {
        name: 'Test Template'
        // Missing other required fields
      };

      const result = templateRepo.validateTemplate(invalidTemplate);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors).toContain('Template language is required');
      expect(result.errors).toContain('Template path is required');
    });
  });

  describe('searchTemplates', () => {
    test('should search templates by name and description', () => {
      const templates = {
        Python: [
          {
            name: 'FastAPI Template',
            description: 'Modern API development with FastAPI',
            language: 'Python',
            features: ['FastAPI', 'async/await', 'OpenAPI']
          },
          {
            name: 'Django Template',
            description: 'Full-stack web development with Django',
            language: 'Python',
            features: ['Django', 'ORM', 'Admin']
          }
        ],
        JavaScript: [
          {
            name: 'React App',
            description: 'Modern React application',
            language: 'JavaScript',
            features: ['React', 'Hooks', 'JSX']
          }
        ]
      };

      const fastApiResults = templateRepo.searchTemplates(templates, 'FastAPI');
      expect(fastApiResults).toHaveLength(1);
      expect(fastApiResults[0].name).toBe('FastAPI Template');

      const modernResults = templateRepo.searchTemplates(templates, 'Modern');
      expect(modernResults).toHaveLength(2);

      const reactResults = templateRepo.searchTemplates(templates, 'React');
      expect(reactResults).toHaveLength(1);
    });

    test('should return empty array for no matches', () => {
      const templates = {
        Python: [
          {
            name: 'Django Template',
            description: 'Web framework',
            language: 'Python',
            features: []
          }
        ]
      };

      const results = templateRepo.searchTemplates(templates, 'nonexistent');
      expect(results).toHaveLength(0);
    });
  });

  describe('getTemplateFiles', () => {
    test('should filter and return template files', async () => {
      const template = {
        path: 'python',
        repository: {
          name: 'Test Repo',
          url: 'https://github.com/test/repo',
          branch: 'main'
        }
      };

      mockGithubMethods.fetchRepositoryStructure.mockResolvedValue({
        'python': [
          { name: 'BOOTSTRAP.md', type: 'blob', path: 'python/BOOTSTRAP.md' },
          { name: 'main.py', type: 'blob', path: 'python/main.py' },
          { name: 'requirements.txt', type: 'blob', path: 'python/requirements.txt' },
          { name: '.git', type: 'tree', path: 'python/.git' },
          { name: 'docs', type: 'tree', path: 'python/docs' }
        ]
      });

      const files = await templateRepo.getTemplateFiles(template);

      expect(files).toHaveLength(2); // Should exclude BOOTSTRAP.md, .git, and docs
      expect(files.find(f => f.name === 'main.py')).toBeTruthy();
      expect(files.find(f => f.name === 'requirements.txt')).toBeTruthy();
      expect(files.find(f => f.name === 'BOOTSTRAP.md')).toBeFalsy();
    });
  });
});
