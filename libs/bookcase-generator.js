const InfoConfig = require('./info-config');

class BookcaseGenerator {
  constructor(configFile) {
    this.infoConfig = new InfoConfig(configFile);
  }

  async assertConfigFileNotExist() {
    try {
      await this.infoConfig.readData();
    } catch(error) {
      if (error.code === 'ENOENT') {
        return;
      } else {
        throw error;
      }
    }
    throw new Error('Configuration file already exists');
  }

  async generate() {
    await this.assertConfigFileNotExist();
    await this.infoConfig.writeData(this.buildTemplateData());
  }

  buildTemplateData() {
    return { wikis: [] };
  }
}

module.exports = BookcaseGenerator;
