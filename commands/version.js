const pkg = require('../package.json');

class VersionCommand {
  async execute() {
    console.log(pkg.version);
  }
}

VersionCommand.noPath = true;
VersionCommand.command = '--version';
VersionCommand.args = '';
VersionCommand.description = 'Displays the version number of tw-bookcase';

module.exports = VersionCommand;
