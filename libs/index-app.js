const path = require('path');
const express = require('express');
const httpProxy = require('http-proxy');
const TWInstance = require('./tiddlywiki-instance');

const WIKI_SLUG = 'index-app';
const SOCKET_FILE_NAME = 'tw-bookcase-socket';

class IndexApp {
  constructor(tiddlyWikiDir, deps = {}) {
    let wikiPath = tiddlyWikiDir || path.join(__dirname, '..', 'app');
    let socketPath = path.join(wikiPath, SOCKET_FILE_NAME);
    this.wikiInstance = deps.wikiInstance || new TWInstance({ wikiPath, socketPath });
    this.wikiInstance.slug = WIKI_SLUG;
    this.proxy = httpProxy.createProxy();
  }

  useInstanceManager(instanceManager) {
    this.instanceManager = instanceManager;
  }

  useConfigManager(configManager) {
    this.wikiInstance.socketPath
      = path.join(configManager.basePath, SOCKET_FILE_NAME);
  }

  buildRouter() {
    let router = express.Router();
    router.get('/', (req, res, next) => this.handleIndex(req, res, next));
    return router;
  }

  async handleIndex(req, res, next) {
    let instance = this.instanceManager.getInstance(WIKI_SLUG);
    if (!instance) {
      instance = await this.instanceManager.addInstance(this.wikiInstance);
    }
    await this.instanceManager.startInstance(WIKI_SLUG);
    let target = { socketPath: instance.socketPath };
    this.proxy.web(req, res, { target });
  }
}

module.exports = IndexApp;
