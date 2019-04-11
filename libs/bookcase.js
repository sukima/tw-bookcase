const http = require('http');
const InstanceManager = require('./instance-manager');
const TWInstance = require('./tiddlywiki-instance');

class Bookcase {
  constructor(options, deps = {}) {
    this.instanceManager = deps.instanceManager || new InstanceManager();
  }

  async startup() {
    await this.instanceManager.startup();
  }

  async shutdown() {
    await this.instanceManager.shutdown();
  }
}

module.exports = Bookcase;
