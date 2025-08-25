const { TemplateBootstrapper } = require('../src/template-bootstrapper');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

describe('Bash Escaping in Template Bootstrapper', () => {
  let bootstrapper;

  beforeEach(() => {
    bootstrapper = new TemplateBootstrapper();
  });

  describe('generateClaudeScript', () => {

    it('should escape parentheses in prompt parts', async () => {
      const promptParts = [
        'A Product Requirement Document (PRD) file will be available',
        'Create all files directly in the current working directory (do not create a new project subdirectory)',
        'Template features: "clean structure" and "easy setup"'
      ];

      const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-wizard-test-'));

      try {
        const result = await bootstrapper.generateClaudeScript(promptParts, workingDir);

        expect(result.success).toBe(true);
        expect(result.scriptPath).toBe(path.join(workingDir, 'bootstrap-with-claude.sh'));

        // Read the generated script
        const scriptContent = fs.readFileSync(result.scriptPath, 'utf-8');

        // Check that parentheses are properly escaped (using string contains for simplicity)
        expect(scriptContent).toContain('\\(PRD\\)');
        expect(scriptContent).toContain('\\(do not create');

        // Check that quotes are properly escaped
        expect(scriptContent).toContain('\\"clean structure\\"');

      } finally {
        // Cleanup
        if (fs.existsSync(workingDir)) {
          fs.rmSync(workingDir, { recursive: true, force: true });
        }
      }
    });

    it('should generate syntactically valid bash script', async () => {
      const promptParts = [
        'Bootstrap a project with special characters: (parentheses), "quotes", and $variables',
        'Handle edge cases like multiple (nested) (parentheses) properly',
        'Template features include: "modern tooling", "best practices", and more'
      ];

      const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-wizard-test-'));

      try {
        const result = await bootstrapper.generateClaudeScript(promptParts, workingDir);

        expect(result.success).toBe(true);

        // Test bash syntax validation
        expect(() => {
          execSync(`bash -n "${result.scriptPath}"`, { stdio: 'pipe' });
        }).not.toThrow();

        // Verify script is executable
        const stats = fs.statSync(result.scriptPath);
        expect(stats.mode & parseInt('111', 8)).not.toBe(0); // Check execute permissions

      } finally {
        // Cleanup
        if (fs.existsSync(workingDir)) {
          fs.rmSync(workingDir, { recursive: true, force: true });
        }
      }
    });

    it('should handle empty and edge case prompt parts', async () => {
      const promptParts = [
        '', // Empty string
        '()', // Just parentheses
        '""', // Just quotes
        'Normal text without special characters',
        'Mix of (parentheses) and "quotes" together'
      ];

      const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-wizard-test-'));

      try {
        const result = await bootstrapper.generateClaudeScript(promptParts, workingDir);

        expect(result.success).toBe(true);

        // Test bash syntax validation - should not throw
        expect(() => {
          execSync(`bash -n "${result.scriptPath}"`, { stdio: 'pipe' });
        }).not.toThrow();

      } finally {
        // Cleanup
        if (fs.existsSync(workingDir)) {
          fs.rmSync(workingDir, { recursive: true, force: true });
        }
      }
    });

    it('should preserve correct branch references', async () => {
      const promptParts = ['Test prompt with branch reference'];
      const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-wizard-test-'));

      try {
        const result = await bootstrapper.generateClaudeScript(promptParts, workingDir, {
          generateAgents: true
        });

        expect(result.success).toBe(true);

        const scriptContent = fs.readFileSync(result.scriptPath, 'utf-8');

        // Check that it uses the correct develop branch, not main
        expect(scriptContent).toMatch(/claude-wizard\/develop\//);
        expect(scriptContent).not.toMatch(/claude-wizard\/main\//);

      } finally {
        // Cleanup
        if (fs.existsSync(workingDir)) {
          fs.rmSync(workingDir, { recursive: true, force: true });
        }
      }
    });

    it('should escape special bash characters correctly', async () => {
      const testCases = [
        {
          input: 'Text with (parentheses)',
          expectedText: '\\(parentheses\\)'
        },
        {
          input: 'Text with "double quotes"',
          expectedText: '\\"double quotes\\"'
        },
        {
          input: 'Mixed (parentheses) and "quotes"',
          expectedTexts: ['\\(parentheses\\)', '\\"quotes\\"']
        }
      ];

      const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-wizard-test-'));

      try {
        for (const testCase of testCases) {
          const result = await bootstrapper.generateClaudeScript([testCase.input], workingDir);

          const scriptContent = fs.readFileSync(result.scriptPath, 'utf-8');

          if (testCase.expectedText) {
            expect(scriptContent).toContain(testCase.expectedText);
          }

          if (testCase.expectedTexts) {
            testCase.expectedTexts.forEach(text => {
              expect(scriptContent).toContain(text);
            });
          }
        }

      } finally {
        // Cleanup
        if (fs.existsSync(workingDir)) {
          fs.rmSync(workingDir, { recursive: true, force: true });
        }
      }
    });
  });

  describe('Regression tests for reported issues', () => {
    it('should fix the original PRD parentheses issue', async () => {
      const problematicPromptParts = [
        'A Product Requirement Document (PRD) file will be available at /some/path',
        'Create all files directly in the current working directory (do not create a new project subdirectory)'
      ];

      const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-wizard-test-'));

      try {
        const result = await bootstrapper.generateClaudeScript(problematicPromptParts, workingDir);

        expect(result.success).toBe(true);

        const scriptContent = fs.readFileSync(result.scriptPath, 'utf-8');

        // These were the exact problematic strings that caused bash syntax errors
        expect(scriptContent).toContain('\\(PRD\\)');
        expect(scriptContent).toContain('\\(do not create a new project subdirectory\\)');

        // Verify the script passes bash syntax validation
        expect(() => {
          execSync(`bash -n "${result.scriptPath}"`, { stdio: 'pipe' });
        }).not.toThrow();

      } finally {
        // Cleanup
        if (fs.existsSync(workingDir)) {
          fs.rmSync(workingDir, { recursive: true, force: true });
        }
      }
    });

    it('should handle the exact content that was causing line 177 error', async () => {
      // This is the actual content that was causing the "syntax error near unexpected token '('"
      const actualProblematicContent = [
        'Please bootstrap the current directory as a Templates/python project called "snake-py"',
        'This template is located at: https://github.com/moinsen-dev/claude-wizard in the templates/python/ directory',
        'Template features: Clean project structure with package layout, Virtual environment setup with uv, Testing framework with pytest, Code formatting with ruff, Type checking with mypy',
        'Create all files and directories directly in the current working directory (do not create a new project subdirectory)',
        'A Product Requirement Document (PRD) file will be available at /Users/udi/work/moinsen/opensource/claude-wizard/snake-prd.md'
      ];

      const workingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-wizard-test-'));

      try {
        const result = await bootstrapper.generateClaudeScript(actualProblematicContent, workingDir);

        expect(result.success).toBe(true);

        // Test that the generated script passes bash validation (this would have failed before the fix)
        expect(() => {
          execSync(`bash -n "${result.scriptPath}"`, { stdio: 'pipe' });
        }).not.toThrow();

        const scriptContent = fs.readFileSync(result.scriptPath, 'utf-8');

        // Verify both echo lines and CLAUDE_PROMPT have proper escaping
        const echoLines = scriptContent.match(/echo ".*"/g) || [];
        const claudePromptLine = scriptContent.match(/CLAUDE_PROMPT=".*"/);

        expect(echoLines.length).toBeGreaterThan(0);
        expect(claudePromptLine).toBeTruthy();

        // All echo lines should have escaped parentheses if they contain them
        echoLines.forEach(line => {
          if (line.includes('(PRD)') || line.includes('(do not create')) {
            expect(line).toContain('\\(');
            expect(line).toContain('\\)');
          }
        });

      } finally {
        // Cleanup
        if (fs.existsSync(workingDir)) {
          fs.rmSync(workingDir, { recursive: true, force: true });
        }
      }
    });
  });
});
