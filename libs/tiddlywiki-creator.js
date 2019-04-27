const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const TWInstance = require('./tiddlywiki-instance');
const { fromCallback } = require('./utils');
const { DirectoryNotEmptyError } = require('./errors');

const SOCKET_NAME = 'tiddlywiki-server-socket';

class TWCreator {
  constructor(twInstance) {
    this.twInstance = twInstance;
  }

  async assertWikiDirectoryIsEmpty() {
    let wikiPath = this.twInstance.wikiPath;
    let [files] = await fromCallback(callback => fs.readdir(wikiPath, callback));
    if (files.length > 0) throw new DirectoryNotEmptyError(wikiPath);
  }

  async createWikiDirectory() {
    let wikiPath = this.twInstance.wikiPath;
    return fromCallback(callback => mkdirp(wikiPath, callback));
  }

  static buildInstance(wikiConfig) {
    let { slug, path: wikiPath } = wikiConfig;
    let socketPath = path.join(wikiPath, SOCKET_NAME);
    let createdAt = new Date().toISOString();
    return new TWInstance({ slug, wikiPath, socketPath, createdAt });
  }

  static async createInstance(wikiConfig) {
    let instance = TWCreator.buildInstance(wikiConfig);
    let creator = new TWCreator(instance);
    try {
      await creator.createWikiDirectory();
    } catch(error) {
      if (error.code !== 'EEXIST') throw error;
      await creator.assertWikiDirectoryIsEmpty();
    }
    await instance.initializeWikiDirectory();
    return instance;
  }
}

module.exports = TWCreator;
