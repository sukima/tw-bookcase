class Logger {
  log() {
    console.log(...arguments);
  }

  info(message, ...details) {
    this.log(`INFO: ${message}`, ...details);
  }

  warn(message, ...details) {
    this.log(`WARNING: ${message}`, ...details);
  }

  error(message, ...details) {
    this.log(`ERROR: ${message}`, ...details);
  }
}

module.exports = Logger;
