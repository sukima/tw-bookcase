const path = require('path');
const IndexApp = require('./index-app');
const WikiProxyApp = require('./wiki-proxy-app');
const BookcaseApp = require('./bookcase-app');
const Server = require('./server');
const InstanceManager = require('./instance-manager');
const BookcaseConfigManager = require('./bookcase-config-manager');
const TWCreator = require('./tiddlywiki-creator');

const ROUTE_NAMESPACES = Object.freeze({
  INDEX: '/',
  BOOKCASE: '/bookcase',
  WIKI_PROXY: '/wikis'
});

class Bookcase {
  constructor(options = {}, deps = {}) {
    let configFile = options.configFile;
    this.configManager = deps.configManager || new BookcaseConfigManager(configFile);
    this.instanceManager = deps.instanceManager || new InstanceManager();
    this.indexInstanceManager = deps.indexInstanceManager || new InstanceManager();
    this.server = deps.server || new Server();
    this.initialize(deps);
  }

  initialize(deps = {}) {
    let indexApp = deps.indexApp || new IndexApp();
    indexApp.namespace = ROUTE_NAMESPACES.INDEX;
    indexApp.useInstanceManager(this.indexInstanceManager);
    this.server.addRouteManager(indexApp);

    let wikiProxyApp = deps.wikiProxy || new WikiProxyApp();
    wikiProxyApp.namespace = ROUTE_NAMESPACES.WIKI_PROXY;
    wikiProxyApp.useInstanceManager(this.instanceManager);
    this.server.addRouteManager(wikiProxyApp);

    let bookcaseApp = deps.bookcaseApp || new BookcaseApp();
    bookcaseApp.namespace = ROUTE_NAMESPACES.BOOKCASE;
    bookcaseApp.useRedirectTransform(slug => {
      return `${ROUTE_NAMESPACES.WIKI_PROXY}/${slug}`;
    });
    bookcaseApp.useInstanceManager(this.instanceManager);
    bookcaseApp.useConfigManager(this.configManager);
    this.server.addRouteManager(bookcaseApp);
  }

  async startup() {
    let config = await this.configManager.readConfig();
    this.server.port = this.server.port || config.port;
    let initTasks = config.wikis.map(wikiConfig => {
      let instance = TWCreator.buildInstance(wikiConfig);
      return this.instanceManager.addInstance(instance);
    });
    await Promise.all(initTasks);
    return this.server.startup();
  }

  async shutdown() {
    await this.server.shutdown();
    await this.instanceManager.reset();
    await this.indexInstanceManager.reset();
  }
}

module.exports = Bookcase;
