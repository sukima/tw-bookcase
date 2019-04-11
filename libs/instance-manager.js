const { allSettled } = require('./utils');

class InstanceManager {
  constructor(deps = {}) {
    this.logger = deps.logger || new Logger();
    this.instanceMap = new Map();
  }

  async shutdown() {
    let instances = this.instanceMap.values();
    let shutdownTasks = instances.map(instance => instance.shutdown());
    let results = await allSettled(shutdownTasks);
    for (let { result, reason } of results) {
      if (result === 'rejected') this.logger.warn(reason);
    }
  }
}

module.exports = InstanceManager;
