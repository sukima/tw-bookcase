const Bookcase = require('../libs/bookcase');
const { maybe } = require('../libs/utils');

function info(msg) {
  return `\x1b[0;33m${msg}\x1b[0m`;
}

function warn(msg) {
  return `\x1b[0;31m${msg}\x1b[0m`;
}

function log(msg) {
  if (process.stdout.isTTY) {
    console.log(msg);
  }
}

class ListenCommand {
  constructor(configPath, [port]) {
    this.path = configPath;
    this.port = maybe(port)
      .bind(p => p.match(/\d+/)[0])
      .value();
  }

  async tearDown() {
    await this.bookcase.shutdown();
  }

  async execute() {
    this.bookcase = new Bookcase({
      configFile: this.path,
      port: this.port
    });
    try {
      let server = await this.bookcase.startup();
      log(info(`Serving on http://127.0.0.1:${server.port}`));
      log(warn('(press ctrl-C to exit)'));
    } catch(error) {
      if (error.code !== 'ENOENT') throw error;
      throw new Error(`Unable to read '${this.path}'.\nHave you ran the --init command first?`);
    }
  }
}

ListenCommand.command = '--listen';
ListenCommand.args = '[PORT]';
ListenCommand.description = 'Start the server on PORT (default: 8088)';

module.exports = ListenCommand;
