const fs = require('fs-extra');
const { spawn } = require('child_process');
const { TemplateBootstrapper } = require('../src/template-bootstrapper');

// Mock fs-extra
jest.mock('fs-extra');

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn(),
  exec: jest.fn()
}));

// Mock os
jest.mock('os', () => ({
  userInfo: jest.fn(() => ({ username: 'testuser' })),
  homedir: jest.fn(() => '/home/testuser')
}));

describe('TemplateBootstrapper', () => {
  let bootstrapper;
  let mockTemplate;

  beforeEach(() => {
    jest.clearAllMocks();
    bootstrapper = new TemplateBootstrapper();

    mockTemplate = {
      name: 'Python Basic Template',
      language: 'Python',
      path: 'python',
      repository: {
        name: 'Test Repo',
        url: 'https://github.com/test/repo',
        branch: 'main'
      },
      metadata: {
        name: 'Python Basic Template',
        description: 'A basic Python project template',
        dependencies: ['fastapi', 'pytest'],
        setupCommands: ['uv sync', 'pytest'],
        features: ['FastAPI', 'Testing']
      }
    };

    // Mock fs-extra methods
    fs.pathExists.mockResolvedValue(false);
    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.readdir.mockResolvedValue([]);
    fs.access.mockResolvedValue();
    fs.existsSync.mockReturnValue(false);
  });

  describe('validateProjectPath', () => {
    test('should validate new project path', async () => {
      fs.pathExists.mockResolvedValue(false);

      const result = await bootstrapper.validateProjectPath('/path/to/new-project');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject path with existing non-empty directory', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readdir.mockResolvedValue(['existing-file.txt']);

      const result = await bootstrapper.validateProjectPath('/path/to/existing-project');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Directory already exists and is not empty');
    });

    test('should accept path with existing empty directory', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readdir.mockResolvedValue([]);

      const result = await bootstrapper.validateProjectPath('/path/to/empty-project');

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject path with non-writable parent', async () => {
      fs.pathExists.mockResolvedValue(false);
      fs.access.mockRejectedValue(new Error('Permission denied'));

      const result = await bootstrapper.validateProjectPath('/readonly/path/project');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Parent directory is not writable');
    });
  });

  describe('prepareVariables', () => {
    test('should prepare template variables correctly', () => {
      const variables = bootstrapper.prepareVariables(mockTemplate, 'My Awesome Project');

      expect(variables).toMatchObject({
        'project-name': 'My Awesome Project',
        'project_name': 'my_awesome_project',
        'projectName': 'myAwesomeProject',
        'ProjectName': 'MyAwesomeProject',
        'project-name-kebab': 'my-awesome-project',
        language: 'python',
        Language: 'Python',
        template: 'Python Basic Template'
      });

      expect(variables.year).toBe(new Date().getFullYear());
      expect(variables.author).toBe('testuser');
    });

    test('should include custom variables', () => {
      const customVars = {
        author: 'Custom Author',
        email: 'custom@example.com'
      };

      const variables = bootstrapper.prepareVariables(mockTemplate, 'Test Project', customVars);

      expect(variables.author).toBe('Custom Author');
      expect(variables.email).toBe('custom@example.com');
    });
  });

  describe('processVariableSubstitution', () => {
    test('should replace template variables in content', () => {
      const content = 'Project: {{project-name}}\nAuthor: {{author}}\nYear: {{year}}';
      const variables = {
        'project-name': 'My Project',
        author: 'Test Author',
        year: 2024
      };

      const result = bootstrapper.processVariableSubstitution(content, variables);

      expect(result).toBe('Project: My Project\nAuthor: Test Author\nYear: 2024');
    });

    test('should handle content without variables', () => {
      const content = 'This is just plain text';
      const variables = { 'project-name': 'My Project' };

      const result = bootstrapper.processVariableSubstitution(content, variables);

      expect(result).toBe('This is just plain text');
    });

    test('should handle multiple occurrences of same variable', () => {
      const content = '{{project-name}} - {{project-name}} Setup';
      const variables = { 'project-name': 'My Project' };

      const result = bootstrapper.processVariableSubstitution(content, variables);

      expect(result).toBe('My Project - My Project Setup');
    });
  });

  describe('detectPackageManager', () => {
    test('should detect Python package managers', () => {
      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('pyproject.toml');
      });

      let result = bootstrapper.detectPackageManager(mockTemplate, '/project/path');
      expect(result).toBe('uv');

      fs.existsSync.mockReturnValue(false);
      result = bootstrapper.detectPackageManager(mockTemplate, '/project/path');
      expect(result).toBe('pip');
    });

    test('should detect JavaScript package managers', () => {
      const jsTemplate = { ...mockTemplate, language: 'JavaScript' };

      fs.existsSync.mockImplementation((filePath) => {
        return filePath.includes('yarn.lock');
      });

      let result = bootstrapper.detectPackageManager(jsTemplate, '/project/path');
      expect(result).toBe('yarn');

      fs.existsSync.mockReturnValue(false);
      result = bootstrapper.detectPackageManager(jsTemplate, '/project/path');
      expect(result).toBe('npm');
    });

    test('should handle other languages', () => {
      const rustTemplate = { ...mockTemplate, language: 'Rust' };
      const result = bootstrapper.detectPackageManager(rustTemplate, '/project/path');
      expect(result).toBe('cargo');

      const unknownTemplate = { ...mockTemplate, language: 'Unknown' };
      const result2 = bootstrapper.detectPackageManager(unknownTemplate, '/project/path');
      expect(result2).toBe('npm'); // Default fallback
    });
  });

  describe('getInstallCommand', () => {
    test('should return correct install commands', () => {
      expect(bootstrapper.getInstallCommand('npm')).toBe('npm install');
      expect(bootstrapper.getInstallCommand('yarn')).toBe('yarn install');
      expect(bootstrapper.getInstallCommand('pip')).toBe('pip install -r requirements.txt');
      expect(bootstrapper.getInstallCommand('uv')).toBe('uv sync');
      expect(bootstrapper.getInstallCommand('cargo')).toBe('cargo build');
      expect(bootstrapper.getInstallCommand('go')).toBe('go mod tidy');
      expect(bootstrapper.getInstallCommand('unknown')).toBe('npm install');
    });
  });

  describe('executeCommand', () => {
    test.skip('should execute command successfully', async () => {
      const mockChild = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn()
      };

      spawn.mockReturnValue(mockChild);

      const executePromise = bootstrapper.executeCommand('npm install', '/project/path');

      // Simulate successful command execution immediately
      setTimeout(() => {
        mockChild.on.mock.calls.forEach(([event, callback]) => {
          if (event === 'close') {
            callback(0); // Success exit code
          }
        });
      }, 0);

      await executePromise;

      expect(spawn).toHaveBeenCalledWith('npm', ['install'], {
        cwd: '/project/path',
        stdio: 'pipe',
        shell: true
      });
    });

    test.skip('should handle command failure', async () => {
      const mockChild = {
        stdout: { on: jest.fn() },
        stderr: { on: jest.fn() },
        on: jest.fn()
      };

      spawn.mockReturnValue(mockChild);

      const executePromise = bootstrapper.executeCommand('invalid-command', '/project/path');

      // Simulate failed command execution immediately
      setTimeout(() => {
        mockChild.stderr.on.mock.calls.forEach(([event, callback]) => {
          if (event === 'data') {
            callback('Command not found');
          }
        });

        mockChild.on.mock.calls.forEach(([event, callback]) => {
          if (event === 'close') {
            callback(1); // Failure exit code
          }
        });
      }, 0);

      await expect(executePromise).rejects.toThrow('Command failed with exit code 1');
    });
  });

  describe('getNextSteps', () => {
    test('should return Python-specific next steps', () => {
      const steps = bootstrapper.getNextSteps(mockTemplate, 'my-python-project');

      expect(steps).toContain('cd my-python-project');
      expect(steps).toContain('python -m venv .venv');
      expect(steps).toContain('source .venv/bin/activate  # On Windows: .venv\\Scripts\\activate');
      expect(steps).toContain('pip install -r requirements.txt');
      expect(steps).toContain('code my-python-project  # Open in VS Code');
    });

    test('should return JavaScript-specific next steps', () => {
      const jsTemplate = { ...mockTemplate, language: 'JavaScript' };
      const steps = bootstrapper.getNextSteps(jsTemplate, 'my-js-project');

      expect(steps).toContain('cd my-js-project');
      expect(steps).toContain('npm start');
      expect(steps).toContain('code my-js-project  # Open in VS Code');
    });

    test('should return generic next steps for unknown languages', () => {
      const unknownTemplate = { ...mockTemplate, language: 'Unknown' };
      const steps = bootstrapper.getNextSteps(unknownTemplate, 'my-project');

      expect(steps).toContain('cd my-project');
      expect(steps).toContain('code my-project  # Open in VS Code');
      expect(steps.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('initializeProject', () => {
    beforeEach(() => {
      // Mock TemplateRepository methods
      const mockGetTemplateFiles = jest.fn().mockResolvedValue([
        { name: 'main.py', path: 'python/main.py', type: 'blob' },
        { name: 'requirements.txt', path: 'python/requirements.txt', type: 'blob' }
      ]);

      const mockDownloadTemplateFile = jest.fn()
        .mockResolvedValueOnce('print("Hello {{project-name}}")')
        .mockResolvedValueOnce('fastapi\npytest');

      // Mock the TemplateRepository class
      jest.doMock('../src/template-repository', () => ({
        TemplateRepository: jest.fn().mockImplementation(() => ({
          getTemplateFiles: mockGetTemplateFiles,
          downloadTemplateFile: mockDownloadTemplateFile
        }))
      }));
    });

    test('should initialize project successfully in dry run mode', async () => {
      const result = await bootstrapper.initializeProject(
        mockTemplate,
        'test-project',
        '/tmp',
        { dryRun: true }
      );

      expect(result.success).toBe(true);
      expect(result.steps).toContain('✓ Validated project path');
      expect(result.steps).toContain('🔍 Dry run mode - would create project structure');
      expect(result.projectPath).toBe('/tmp/test-project');
    });

    test('should handle validation failures', async () => {
      fs.pathExists.mockResolvedValue(true);
      fs.readdir.mockResolvedValue(['existing-file']);

      const result = await bootstrapper.initializeProject(
        mockTemplate,
        'test-project',
        '/tmp'
      );

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Directory already exists and is not empty');
    });

    test('should handle initialization errors', async () => {
      fs.ensureDir.mockRejectedValue(new Error('Permission denied'));

      const result = await bootstrapper.initializeProject(
        mockTemplate,
        'test-project',
        '/tmp'
      );

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });
});
