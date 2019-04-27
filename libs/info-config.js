const fs = require('fs');
const path = require('path');
const { fromCallback } = require('./utils');

const INFO_FILE_INDENT = 4;

class InfoConfig {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async readData() {
    let [payload] = await fromCallback(callback => {
      fs.readFile(this.filePath, 'UTF-8', callback);
    });
    return JSON.parse(payload);
  }

  async writeData(infoData) {
    let payload = JSON.stringify(infoData, null, INFO_FILE_INDENT);
    return fromCallback(callback => {
      fs.writeFile(this.filePath, payload, callback);
    });
  }
}

module.exports = InfoConfig;
