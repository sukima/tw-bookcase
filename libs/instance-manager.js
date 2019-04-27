const path = require('path');
const AutoShutdownManager = require('./auto-shutdown-manager');
const { allSettled, arrayRemove } = require('./utils');
const { MissingInstanceError, UniqueInstanceError } = require('./errors');

class InstanceManager {
  constructor(deps = {}) {
    this.autoShutdownManager = deps.autoShutdownManager
      || new AutoShutdownManager();
    this.instances = [];
  }

  getInstance(slug) {
    return this.instances.find(instance => instance.slug === slug);
  }

  findByPath(wikiPath) {
    return this.instances.find(instance => instance.wikiPath === wikiPath);
  }

  async addInstance(instance) {
    let { slug, wikiPath } = instance;
    if (this.getInstance(slug)) throw new UniqueInstanceError(wikiPath);
    await instance.initialize();
    this.instances.push(instance);
    return instance;
  }

  async removeInstance(instance) {
    await this.stopInstance(instance.slug);
    return arrayRemove(this.instances, instance);
  }

  notifyActivity(slug) {
    let instance = this.getInstance(slug);
    this.autoShutdownManager.refresh(instance);
  }

  async startInstance(slug) {
    let instance = this.getInstance(slug);
    if (!instance) throw new MissingInstanceError(slug);
    await instance.startup();
    this.autoShutdownManager.refresh(instance);
    return instance;
  }

  async stopInstance(slug) {
    let instance = this.getInstance(slug);
    if (!instance) throw new MissingInstanceError(slug);
    this.autoShutdownManager.unregister(instance);
    await instance.shutdown();
  }

  async reset() {
    this.autoShutdownManager.reset();
    let shutdownTasks = this.instances.map(instance => instance.shutdown());
    let results = await allSettled(shutdownTasks);
    for (let { result, reason } of results) {
      if (result === 'rejected') console.error(reason);
    }
    this.instances = [];
  }
}

module.exports = InstanceManager;
