const express = require('express');
const httpProxy = require('http-proxy');
const { deprefixUrl } = require('./utils');

class WikiProxyApp {
  constructor() {
    this.proxy = httpProxy.createProxy();
  }

  useInstanceManager(instanceManager) {
    this.instanceManager = instanceManager;
  }

  getRoutePrefix(slug) {
    return `${this.namespace}/${slug}`;
  }

  buildRouter() {
    let router = express.Router();
    router.all(['/:slug', '/:slug/*'], (req, res, next) => {
      this.handleRequest(req, res, next);
    });
    return router;
  }

  async handleRequest(req, res, next) {
    let instance;
    let slug = req.params.slug;
    try {
      instance = await this.instanceManager.startInstance(slug);
    } catch(error) {
      if (error.code !== 'ENOENT') throw error;
      res.status(404).send(error.message);
      return;
    }
    let target = { socketPath: instance.socketPath };
    req.url = deprefixUrl(req.url, slug);
    instance.setHostConfig(this.getRoutePrefix(slug));
    this.proxy.web(req, res, { target });
  }
}

module.exports = WikiProxyApp;
