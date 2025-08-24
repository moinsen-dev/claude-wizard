const { processAgentContent, convertToCommand, parseYAMLFrontmatter } = require('../src/utils');

describe('Agent Content Processing', () => {
  const sampleAgent = `---
name: test-agent
description: A test agent for unit testing
tools: Read, Write, Edit
---

You are a test agent for unit testing purposes.`;

  describe('processAgentContent', () => {
    test('should add model when specified', () => {
      const result = processAgentContent(sampleAgent, { model: 'opus' });
      expect(result).toContain('model: opus');
    });

    test('should add color when assignColors is true', () => {
      const result = processAgentContent(sampleAgent, { assignColors: true });
      expect(result).toMatch(/color: (red|blue|green|yellow|purple|orange|pink|cyan)/);
    });

    test('should not modify content when no options', () => {
      const result = processAgentContent(sampleAgent);
      expect(result).toBe(sampleAgent);
    });

    test('should handle both model and color', () => {
      const result = processAgentContent(sampleAgent, { 
        model: 'sonnet', 
        assignColors: true 
      });
      expect(result).toContain('model: sonnet');
      expect(result).toMatch(/color: (red|blue|green|yellow|purple|orange|pink|cyan)/);
    });
  });

  describe('convertToCommand', () => {
    test('should convert agent to command format', () => {
      const result = convertToCommand(sampleAgent);
      const expected = `### test-agent

### A test agent for unit testing

You are a test agent for unit testing purposes.`;
      expect(result).toBe(expected);
    });

    test('should handle agents without description', () => {
      const agentWithoutDesc = `---
name: test-agent
tools: Read, Write
---

Test content.`;
      
      const result = convertToCommand(agentWithoutDesc);
      expect(result).toContain('### test-agent');
      expect(result).toContain('### No description available');
      expect(result).toContain('Test content.');
    });
  });

  describe('parseYAMLFrontmatter', () => {
    test('should parse valid YAML frontmatter', () => {
      const { metadata, body } = parseYAMLFrontmatter(sampleAgent);
      expect(metadata.name).toBe('test-agent');
      expect(metadata.description).toBe('A test agent for unit testing');
      expect(body.trim()).toBe('You are a test agent for unit testing purposes.');
    });

    test('should throw error for invalid frontmatter', () => {
      const invalidAgent = 'No YAML frontmatter here';
      expect(() => parseYAMLFrontmatter(invalidAgent)).toThrow('No YAML frontmatter found');
    });
  });
});