const path = require('path');
const InfoConfig = require('./info-config');
const { arrayRemove, maybe } = require('./utils');

const DEFAULT_WIKI_DIR = 'wikis';

class BookcaseConfigManager {
  constructor(configPath) {
    this.basePath = path.join(path.dirname(path.resolve(configPath)), DEFAULT_WIKI_DIR);
    this.config = new InfoConfig(configPath);
  }

  async readConfig() {
    if (!this._data) {
      this._data = await this.config.readData();
    }
    return this._data;
  }

  async readWikiList() {
    let data = await this.readConfig();
    return data.wikis;
  }

  async addWiki(instance) {
    let data = await this.readConfig();
    let entry = data.wikis.find(entry => entry.slug === instance.slug);
    if (!entry) {
      entry = {};
      data.wikis.push(entry);
    }
    entry.slug = instance.slug;
    entry.path = instance.wikiPath;
    entry.createdAt = instance.createdAt;
    await this.config.writeData(data);
  }

  async removeWiki(instance) {
    let data = await this.readConfig();
    let entry = data.wikis.find(entry => entry.slug === instance.slug);
    if (!entry) return;
    arrayRemove(data.wikis, entry);
    await this.config.writeData(data);
  }

  async getDefaultPath() {
    return maybe(await this.readConfig())
      .prop('defaultPath')
      .value(this.basePath);
  }
}

module.exports = BookcaseConfigManager;
