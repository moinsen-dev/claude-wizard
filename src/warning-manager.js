const chalk = require('chalk');

class WarningManager {
  constructor() {
    this.warnings = new Set();
    this.displayed = false;
  }

  /**
   * Add a warning message (prevents duplicates)
   * @param {string} message - Warning message
   */
  addWarning(message) {
    this.warnings.add(message);
  }

  /**
   * Display all collected warnings once
   */
  displayWarnings() {
    if (this.warnings.size === 0 || this.displayed) {
      return;
    }

    console.log(chalk.yellow('\n⚠️  Warnings:'));
    this.warnings.forEach(warning => {
      console.log(chalk.gray(`  • ${warning}`));
    });
    console.log('');

    this.displayed = true;
  }

  /**
   * Clear all warnings
   */
  clearWarnings() {
    this.warnings.clear();
    this.displayed = false;
  }

  /**
   * Check if there are any warnings
   * @returns {boolean} True if there are warnings
   */
  hasWarnings() {
    return this.warnings.size > 0;
  }

  /**
   * Get count of warnings
   * @returns {number} Number of warnings
   */
  getWarningCount() {
    return this.warnings.size;
  }
}

// Create a singleton instance
const warningManager = new WarningManager();

module.exports = { WarningManager, warningManager };
