// Mock all external dependencies before importing
jest.mock('fs-extra');
jest.mock('chalk', () => ({
  green: jest.fn(msg => msg),
  red: jest.fn(msg => msg),
  blue: jest.fn(msg => msg),
  yellow: jest.fn(msg => msg)
}));
jest.mock('ora');
jest.mock('../src/github.js');
jest.mock('../src/utils.js');

const fs = require('fs-extra');
const path = require('path');
const ora = require('ora');
const { Installer } = require('../src/installer.js');
const { GitHubAPI } = require('../src/github.js');
const utils = require('../src/utils.js');

describe('Installer', () => {
  let installer;
  let mockSpinner;

  beforeEach(() => {
    jest.clearAllMocks();
    // Create fresh mocks
    mockSpinner = {
      start: jest.fn().mockReturnThis(),
      succeed: jest.fn().mockReturnThis(),
      fail: jest.fn().mockReturnThis(),
      text: ''
    };

    // Setup mocks
    ora.mockReturnValue(mockSpinner);

    // Setup GitHub API mock properly
    const mockGitHubInstance = {
      downloadAgent: jest.fn().mockResolvedValue('test content')
    };
    GitHubAPI.mockImplementation(() => mockGitHubInstance);

    fs.ensureDir.mockResolvedValue();
    fs.writeFile.mockResolvedValue();
    fs.pathExists.mockResolvedValue(true);
    fs.remove.mockResolvedValue();

    utils.loadConfig.mockResolvedValue({
      installedAgents: [],
      installedCommands: []
    });
    utils.saveConfig.mockResolvedValue();
    utils.processAgentContent.mockReturnValue('processed content');
    utils.convertToCommand.mockReturnValue('command content');

    // Mock console
    console.log = jest.fn();

    installer = new Installer();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with GitHubAPI instance', () => {
      expect(installer).toBeInstanceOf(Installer);
      expect(installer.github).toBeDefined();
    });
  });

  describe('installAgents', () => {
    const mockSelectedAgents = [
      {
        agent: { name: 'test-agent', path: 'agents/test-agent.md' },
        department: 'development'
      }
    ];

    const mockRepository = {
      url: 'https://github.com/test/repo',
      branch: 'main'
    };

    const mockTargetPath = '/test/path';

    it('should successfully install agents', async () => {
      const result = await installer.installAgents(
        mockSelectedAgents,
        mockTargetPath,
        mockRepository
      );

      expect(ora).toHaveBeenCalledWith('Downloading and processing agents...');
      expect(mockSpinner.start).toHaveBeenCalled();
      expect(fs.ensureDir).toHaveBeenCalledWith(mockTargetPath);
      expect(fs.ensureDir).toHaveBeenCalledWith(path.join(mockTargetPath, 'development'));
      expect(installer.github.downloadAgent).toHaveBeenCalledWith(
        mockRepository.url,
        'agents/test-agent.md',
        mockRepository.branch
      );
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(mockTargetPath, 'development', 'test-agent.md'),
        'processed content',
        'utf8'
      );
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Installation complete!');

      expect(result.installed).toHaveLength(1);
      expect(result.failed).toHaveLength(0);
      expect(result.installed[0]).toEqual({
        name: 'test-agent',
        department: 'development',
        path: path.join(mockTargetPath, 'development', 'test-agent.md')
      });
    });

    it('should install as commands when installationType is commands', async () => {
      const options = { installationType: 'commands' };

      const result = await installer.installAgents(
        mockSelectedAgents,
        mockTargetPath,
        mockRepository,
        options
      );

      expect(utils.convertToCommand).toHaveBeenCalledWith('test content');
      expect(utils.processAgentContent).not.toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledWith(
        path.join(mockTargetPath, 'development', 'test-agent.md'),
        'command content',
        'utf8'
      );
      expect(result.installed).toHaveLength(1);
    });

    it('should handle installation failures', async () => {
      installer.github.downloadAgent.mockRejectedValue(new Error('Network error'));

      const result = await installer.installAgents(
        mockSelectedAgents,
        mockTargetPath,
        mockRepository
      );

      expect(result.installed).toHaveLength(0);
      expect(result.failed).toHaveLength(1);
      expect(result.failed[0]).toEqual({
        name: 'test-agent',
        error: 'Network error'
      });
    });

    it('should handle complete installation failure', async () => {
      fs.ensureDir.mockRejectedValue(new Error('Permission denied'));

      await expect(
        installer.installAgents(mockSelectedAgents, mockTargetPath, mockRepository)
      ).rejects.toThrow('Permission denied');

      expect(mockSpinner.fail).toHaveBeenCalledWith('Installation failed');
    });
  });

  describe('updateAgents', () => {
    it('should check for updates successfully', async () => {
      await installer.updateAgents('/test/path');

      expect(ora).toHaveBeenCalledWith('Checking for updates...');
      expect(mockSpinner.start).toHaveBeenCalled();
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Update check complete');
    });
  });

  describe('removeAgents', () => {
    const mockAgentsToRemove = [
      { name: 'agent-1', department: 'development' }
    ];

    const mockConfig = {
      installedAgents: [
        { name: 'agent-1', department: 'development' },
        { name: 'agent-2', department: 'testing' }
      ],
      installedCommands: []
    };

    it('should remove agents successfully', async () => {
      utils.loadConfig.mockResolvedValue(mockConfig);

      await installer.removeAgents(mockAgentsToRemove, '/test/path');

      expect(utils.loadConfig).toHaveBeenCalled();
      expect(fs.pathExists).toHaveBeenCalledWith('/test/path/development/agent-1.md');
      expect(fs.remove).toHaveBeenCalledWith('/test/path/development/agent-1.md');
      expect(utils.saveConfig).toHaveBeenCalledWith({
        installedAgents: [{ name: 'agent-2', department: 'testing' }],
        installedCommands: []
      });
      expect(mockSpinner.succeed).toHaveBeenCalledWith('Removed 1 agents');
    });
  });

  describe('listInstalledAgents', () => {
    it('should list installed agents with file existence check', async () => {
      const mockConfig = {
        installedAgents: [
          { name: 'agent-1', department: 'development', installedAt: '2023-01-01', source: 'test' }
        ]
      };

      utils.loadConfig.mockResolvedValue(mockConfig);
      fs.pathExists.mockResolvedValue(true);

      const result = await installer.listInstalledAgents('/test/path');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        name: 'agent-1',
        department: 'development',
        path: '/test/path/development/agent-1.md',
        exists: true,
        installedAt: '2023-01-01',
        source: 'test'
      });
    });
  });

  describe('syncConfigWithFilesystem', () => {
    it('should sync when all files exist', async () => {
      const mockConfig = {
        installedAgents: [{ name: 'agent-1', department: 'development' }],
        installedCommands: []
      };

      utils.loadConfig.mockResolvedValue(mockConfig);
      fs.pathExists.mockResolvedValue(true);

      const result = await installer.syncConfigWithFilesystem('/test/agents');

      expect(result).toEqual({
        agentsChanged: false,
        commandsChanged: false
      });
      expect(utils.saveConfig).not.toHaveBeenCalled();
    });

    it('should remove orphaned config entries', async () => {
      const mockConfig = {
        installedAgents: [
          { name: 'agent-1', department: 'development' },
          { name: 'agent-2', department: 'testing' }
        ],
        installedCommands: []
      };

      utils.loadConfig.mockResolvedValue(mockConfig);
      fs.pathExists
        .mockResolvedValueOnce(true)   // agent-1 exists
        .mockResolvedValueOnce(false); // agent-2 doesn't exist

      const result = await installer.syncConfigWithFilesystem('/test/agents');

      expect(result).toEqual({
        agentsChanged: true,
        commandsChanged: false
      });
      expect(utils.saveConfig).toHaveBeenCalledWith({
        installedAgents: [{ name: 'agent-1', department: 'development' }],
        installedCommands: []
      });
    });
  });
});
