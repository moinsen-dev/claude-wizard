const axios = require('axios');
const NodeCache = require('node-cache');

class GitHubAPI {
  constructor() {
    this.cache = new NodeCache({ stdTTL: 3600 }); // 1 hour cache
    this.rateLimitRemaining = 5000;
    this.rateLimitReset = 0;
  }

  async fetchRepositoryStructure(repoUrl, branch = 'main') {
    const cacheKey = `repo_structure_${repoUrl}_${branch}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const { owner, repo } = this.parseRepoUrl(repoUrl);
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;

    try {
      const response = await this.makeRequest(url);
      const structure = this.parseTreeResponse(response.data);
      this.cache.set(cacheKey, structure);
      return structure;
    } catch (error) {
      throw new Error(`Failed to fetch repository structure: ${error.message}`);
    }
  }

  async downloadAgent(repoUrl, path, branch = 'main') {
    const cacheKey = `agent_${repoUrl}_${path}_${branch}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const { owner, repo } = this.parseRepoUrl(repoUrl);
    const encodedBranch = encodeURIComponent(branch);
    const url = `https://raw.githubusercontent.com/${owner}/${repo}/${encodedBranch}/${path}`;

    try {
      const response = await axios.get(url);
      const content = response.data;
      this.cache.set(cacheKey, content);
      return content;
    } catch (error) {
      throw new Error(`Failed to download agent ${path}: ${error.message}`);
    }
  }

  parseAgentMetadata(content) {
    try {
      if (!content.startsWith('---')) {
        return {
          metadata: { name: 'Untitled Agent', description: 'No metadata found' },
          body: content,
          fullContent: content
        };
      }

      const endIndex = content.indexOf('---', 3);
      if (endIndex === -1) {
        return {
          metadata: { name: 'Untitled Agent', description: 'Invalid frontmatter format' },
          body: content,
          fullContent: content
        };
      }

      const frontmatterContent = content.substring(3, endIndex).trim();
      const body = content.substring(endIndex + 3).trim();

      // Extract metadata using simple text parsing instead of YAML
      const metadata = this.extractMetadataFromText(frontmatterContent);

      return { metadata, body, fullContent: content };
    } catch {
      // Fallback to basic metadata
      return {
        metadata: { name: 'Unknown Agent', description: 'Could not parse agent metadata' },
        body: content,
        fullContent: content
      };
    }
  }

  extractMetadataFromText(frontmatterContent) {
    const metadata = {};
    const lines = frontmatterContent.split('\n');

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) continue;

      const colonIndex = trimmedLine.indexOf(':');
      if (colonIndex === -1) continue;

      const key = trimmedLine.substring(0, colonIndex).trim();
      let value = trimmedLine.substring(colonIndex + 1).trim();

      // Remove quotes if present
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith('\'') && value.endsWith('\''))) {
        value = value.slice(1, -1);
      }

      // Handle common fields - store all fields, not just specific ones
      if (key === 'tools') {
        // Handle tools as array or string
        if (value.includes(',')) {
          metadata[key] = value.split(',').map(t => t.trim());
        } else if (value.includes('[') && value.includes(']')) {
          // Handle array format like [tool1, tool2]
          const arrayContent = value.replace(/[[\]]/g, '');
          metadata[key] = arrayContent.split(',').map(t => t.trim());
        } else {
          metadata[key] = value;
        }
      } else {
        metadata[key] = value;
      }
    }

    // Ensure we have at least basic metadata
    if (!metadata.name) {
      metadata.name = 'Untitled Agent';
    }
    if (!metadata.description) {
      metadata.description = 'No description available';
    }

    return metadata;
  }

  parseRepoUrl(repoUrl) {
    const match = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!match) {
      throw new Error('Invalid GitHub repository URL');
    }
    return { owner: match[1], repo: match[2] };
  }

  parseTreeResponse(data) {
    const agents = {};

    data.tree
      .filter(item => item.type === 'blob' && item.path.endsWith('.md'))
      .filter(item => !['README.md', 'LICENSE.md', 'CONTRIBUTING.md', 'Plan-Claude-Agent-Npm-Tool.md', 'CLAUDE.md'].includes(item.path.split('/').pop()))
      .forEach(item => {
        const pathParts = item.path.split('/');
        if (pathParts.length < 2) return; // Skip files in root directory

        const department = pathParts[0];
        const filename = pathParts[pathParts.length - 1];

        if (!agents[department]) {
          agents[department] = [];
        }

        agents[department].push({
          name: filename.replace('.md', ''),
          path: item.path,
          url: item.url
        });
      });

    return agents;
  }

  async makeRequest(url) {
    if (this.rateLimitRemaining <= 10) {
      const waitTime = (this.rateLimitReset * 1000) - Date.now();
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    const response = await axios.get(url);
    this.rateLimitRemaining = parseInt(response.headers['x-ratelimit-remaining']) || this.rateLimitRemaining - 1;
    this.rateLimitReset = parseInt(response.headers['x-ratelimit-reset']) || this.rateLimitReset;

    return response;
  }
}

module.exports = { GitHubAPI };

