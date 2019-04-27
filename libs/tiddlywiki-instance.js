const fs = require('fs');
const path = require('path');
const bootprefix = require('tiddlywiki/boot/bootprefix').bootprefix;
const TiddlyWiki = require('tiddlywiki/boot/boot').TiddlyWiki;
const { arrayRemove, fromCallback } = require('./utils');

const WIKI_TITLE_TIDDLER = '$:/SiteTitle';
const WIKI_HOST_CONFIG = '$:/config/tiddlyweb/host';
const WIKI_RENDER_TIDDLER = '$:/core/save/all';
const STARTUP_HOOK = 'th-server-command-post-start';
const PORT_ENV_NAME = 'TW_SOCKET';

class TWInstance {
  constructor(options, deps = {}) {
    this.slug = options.slug;
    this.wikiPath = options.wikiPath;
    this.socketPath = options.socketPath;
    this.createdAt = options.createdAt;
  }

  setupWiki() {
    let $tw = {
      node: true,
      browser: false,
      nodeWebKit: false,
      boot: { suppressBoot: true },
      wikiPath: this.wikiPath
    };
    this.$tw = TiddlyWiki(bootprefix($tw));
  }

  addWikiHook(hookName, handler) {
    this.$tw.hooks.addHook(hookName, handler);
  }

  removeWikiHook(hookName, handler) {
    let handlers = this.$tw.hooks.names[hookName] || [];
    arrayRemove(handlers, handler);
  }

  setHostConfig(routePath) {
    if (routePath.indexOf('/') !== 0) {
      routePath = `/${routePath}`;
    }
    if (routePath.indexOf('/') !== routePath.length - 1) {
      routePath = `${routePath}/`;
    }
    let text = `$protocol$//$host$${routePath}`;
    this.$tw.wiki.addTiddler({ title: WIKI_HOST_CONFIG, text });
  }

  async executeWikiCommand(...args) {
    if (this.isRunning) {
      throw new Error('executeWikiCommand cannot be called while isRunning is true');
    }
    return fromCallback(callback => {
      this.$tw.boot.argv = args;
      this.$tw.boot.boot(callback);
    });
  }

  async initialize() {
    this.setupWiki();
    await this.executeWikiCommand('--load', this.wikiPath);
  }

  async initializeWikiDirectory() {
    this.setupWiki();
    await this.executeWikiCommand(this.wikiPath, '--init', 'server');
  }

  async removeStaleSocket() {
    try {
      await fromCallback(callback => fs.unlink(this.socketPath, callback));
    } catch(error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  async isValidWiki() {
    let tiddlyInfoFile = path.join(this.wikiPath, 'tiddlywiki.info');
    try {
      await fromCallback(callback => fs.stat(tiddlyInfoFile, callback));
      return true;
    } catch(error) {
      if (error.code !== 'ENOENT') throw error;
      return false;
    }
  }

  async startup() {
    let hookHandler;
    if (this.isRunning) return;
    await this.removeStaleSocket();
    try {
      this.httpServer = await new Promise(resolve => {
        hookHandler = (_, httpServer) => resolve(httpServer);
        process.env[PORT_ENV_NAME] = this.socketPath;
        this.setupWiki();
        this.addWikiHook(STARTUP_HOOK, hookHandler);
        this.executeWikiCommand(this.wikiPath, '--listen', `port=${PORT_ENV_NAME}`);
      });
    } finally {
      this.removeWikiHook(STARTUP_HOOK, hookHandler);
      process.env[PORT_ENV_NAME] = null;
      hookHandler = null;
    }
  }

  async shutdown() {
    if (!this.isRunning) return;
    try {
      await fromCallback(callback => this.httpServer.close(callback))
    } finally {
      this.httpServer = null;
    }
  }

  get wikiTitle() {
    return this.$tw.wiki
      .renderTiddler('text/plain-formatted', WIKI_TITLE_TIDDLER)
      .trim();
  }

  get isRunning() {
    return !!this.httpServer;
  }
}

module.exports = TWInstance;
