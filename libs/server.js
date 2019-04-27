const morgan = require('morgan');
const express = require('express');
const { fromCallback } = require('./utils');

const DEFAULT_PORT = 8088;

class Server {
  constructor() {
    this.app = express();
    this.app.use(morgan('combined'));
  }

  addRouteManager(routeManager) {
    let routePrefix = routeManager.namespace || '/';
    this.app.use(routePrefix, routeManager.buildRouter(routePrefix));
  }

  async startup() {
    let port = this.port || DEFAULT_PORT;
    await fromCallback(callback => this.app.listen(port, callback));
    return { port };
  }

  async shutdown() {}
}

module.exports = Server;
