const BookcaseGenerator = require('../libs/bookcase-generator');

class InitCommand {
  constructor(configFile) {
    this.configFile = configFile;
  }

  async execute() {
    console.log(`Generating ${this.configFile}`);
    let generator = new BookcaseGenerator(this.configFile);
    await generator.generate();
  }
}

InitCommand.command = '--init';
InitCommand.args = '';
InitCommand.description = 'Generate a new config file';

module.exports = InitCommand;
