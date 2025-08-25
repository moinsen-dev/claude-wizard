const picocolors = require('picocolors');

class UIUtils {
  /**
   * Format template information for better display
   * @param {Object} template - Template object
   * @returns {string} Formatted template info
   */
  static formatTemplateInfo(template) {
    const lines = [];

    lines.push(picocolors.bold(picocolors.cyan(`${template.name}`)));

    if (template.description) {
      const description = template.description.length > 80
        ? template.description.substring(0, 80) + '...'
        : template.description;
      lines.push(picocolors.gray(`  ${description}`));
    }

    lines.push(picocolors.gray(`  Repository: ${template.repository.name}`));

    if (template.features && template.features.length > 0) {
      const features = template.features.slice(0, 3).join(', ');
      const moreFeatures = template.features.length > 3 ? `... +${template.features.length - 3} more` : '';
      lines.push(picocolors.gray(`  Features: ${features}${moreFeatures}`));
    }

    return lines.join('\n');
  }

  /**
   * Create a visual separator
   * @param {string} title - Title for the separator
   * @param {number} width - Width of the separator
   * @returns {string} Formatted separator
   */
  static createSeparator(title = '', width = 60) {
    if (!title) {
      return picocolors.gray('─'.repeat(width));
    }

    const padding = Math.max(0, width - title.length - 4);
    const leftPad = Math.floor(padding / 2);
    const rightPad = Math.ceil(padding / 2);

    return picocolors.gray(
      '─'.repeat(leftPad) + ` ${title} ` + '─'.repeat(rightPad)
    );
  }

  /**
   * Format a list of templates by language
   * @param {Object} availableTemplates - Templates grouped by language
   * @returns {string} Formatted template listing
   */
  static formatTemplatesList(availableTemplates) {
    const output = [];

    output.push(picocolors.bold(picocolors.cyan('\n📋 Available Templates\n')));

    Object.entries(availableTemplates).forEach(([language, templates], index) => {
      if (index > 0) output.push('');

      output.push(picocolors.bold(picocolors.white(`${language}:`)));

      templates.forEach(template => {
        output.push(this.formatTemplateInfo(template));
        output.push(''); // Add spacing between templates
      });
    });

    output.push(picocolors.white('Usage:'));
    output.push(picocolors.gray('  claude-wizard bootstrap --template <template-name>'));
    output.push(picocolors.gray('  claude-wizard bootstrap  # Interactive selection'));

    return output.join('\n');
  }

  /**
   * Format success message
   * @param {string} message - Success message
   * @returns {string} Formatted success message
   */
  static formatSuccess(message) {
    return picocolors.green(`✅ ${message}`);
  }

  /**
   * Format error message
   * @param {string} message - Error message
   * @returns {string} Formatted error message
   */
  static formatError(message) {
    return picocolors.red(`❌ ${message}`);
  }

  /**
   * Format warning message
   * @param {string} message - Warning message
   * @returns {string} Formatted warning message
   */
  static formatWarning(message) {
    return picocolors.yellow(`⚠️  ${message}`);
  }

  /**
   * Format info message
   * @param {string} message - Info message
   * @returns {string} Formatted info message
   */
  static formatInfo(message) {
    return picocolors.blue(`ℹ️  ${message}`);
  }

  /**
   * Create a box around text
   * @param {string} text - Text to box
   * @param {string} title - Optional title
   * @returns {string} Boxed text
   */
  static createBox(text, title = '') {
    const lines = text.split('\n');
    const maxWidth = Math.max(...lines.map(line => line.length), title.length + 4);
    const width = maxWidth + 4;

    const output = [];

    // Top border
    if (title) {
      const titlePadding = Math.max(0, width - title.length - 4);
      const leftPad = Math.floor(titlePadding / 2);
      const rightPad = Math.ceil(titlePadding / 2);
      output.push(picocolors.gray(`┌${'─'.repeat(leftPad)} ${title} ${'─'.repeat(rightPad)}┐`));
    } else {
      output.push(picocolors.gray(`┌${'─'.repeat(width - 2)}┐`));
    }

    // Content lines
    lines.forEach(line => {
      const padding = ' '.repeat(Math.max(0, maxWidth - line.length));
      output.push(picocolors.gray(`│ ${line}${padding} │`));
    });

    // Bottom border
    output.push(picocolors.gray(`└${'─'.repeat(width - 2)}┘`));

    return output.join('\n');
  }

  /**
   * Format a progress message
   * @param {string} message - Progress message
   * @param {number} current - Current step
   * @param {number} total - Total steps
   * @returns {string} Formatted progress message
   */
  static formatProgress(message, current, total) {
    const percentage = Math.round((current / total) * 100);
    const progress = `[${current}/${total}]`;
    return picocolors.cyan(`${progress} ${message} (${percentage}%)`);
  }
}

module.exports = { UIUtils };
