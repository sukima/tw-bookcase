const bootprefix = require('tiddlywiki/boot/bootprefix').bootprefix;
const TiddlyWiki = require('tiddlywiki/boot/boot').TiddlyWiki;
const { slugify, fromCallback } = require('./utils');

const STARTUP_HOOK = 'th-server-command-post-start';
const PORT_ENV_NAME = 'TW_SOCKET';

class TWInstance {
  constructor(options) {
    this.wikiTitle = options.wikiTitle;
    this.wikiPath = options.wikiPath;
    this.socketPath = options.socketPath;
    this.slug = slugify(this.wikiTitle);
    this.setupWiki();
  }

  setupWiki() {
    let $tw = {
      node: true,
      browser: false,
      nodeWebKit: false,
      boot: {
        argv: [this.wikiPath, '--listen', `port=${PORT_ENV_NAME}`],
        suppressBoot: true
      }
    };
    this.$tw = TiddlyWiki(bootprefix($tw));
  }

  addWikiHook(hookName, handler) {
    this.$tw.hooks.addHook(hookName, handler);
  }

  removeWikiHook(hookName, handler) {
    let handlers = this.$tw.hooks.names[hookName] || [];
    let index = handlers.indexOf(handler);
    if (index >= 0) handlers.splice(index, 1);
  }

  async startup() {
    let hookHandler;
    this.isRunning = false;
    try {
      this.httpServer = await new Promise(resolve => {
        hookHandler = (_, httpServer) => resolve(httpServer);
        process.env[PORT_ENV_NAME] = this.socketPath;
        this.addWikiHook(STARTUP_HOOK, hookHandler);
        this.$tw.boot.boot();
      });
    } finally {
      this.removeWikiHook(STARTUP_HOOK, hookHandler);
      process.env[PORT_ENV_NAME] = null;
      hookHandler = null;
    }
  }

  async shutdown() {
    try {
      await fromCallback(callback => {
        this.httpServer.close(callback);
      });
    } finally {
      this.httpServer = null;
    }
  }

  get isRunning() {
    return !!this.httpServer;
  }
}

module.exports = TWInstance;
