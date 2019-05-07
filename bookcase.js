#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { fromCallback } = require('./libs/utils');

const DEFAULT_CONFIG_FILE = 'tw-bookcase.info';
let commands, currentCommand;

class UnknownCommand {
  execute() {
    showHelp();
    cleanExit(1);
  }
}
UnknownCommand.noPath = true;

function showHelp() {
  console.log('Usage: tw-bookcase CONFIG COMMAND [ARGS]');
  console.log();
  for (let { command, args, description } of commands) {
    console.log(`  ${command} ${args} - ${description}`);
  }
}

async function buildConfigFilePath(configPath) {
  if (!configPath) return;
  let configFile = path.resolve(configPath);
  let [stats] = await fromCallback(callback => fs.stat(configFile, callback));
  if (stats.isDirectory() || stats.isSymbolicLink()) {
    configFile = path.join(configFile, DEFAULT_CONFIG_FILE);
  }
  return configFile;
}

async function requireCommands() {
  let commandDir = path.join(__dirname, 'commands');
  let [files] = await fromCallback(callback => {
    fs.readdir(commandDir, { withFileTypes: true }, callback);
  });
  return files
    .filter(entry => entry.isFile)
    .map(entry => require(path.join(commandDir, entry.name)));
}

async function cleanExit(code) {
  try {
    if (currentCommand && currentCommand.tearDown) {
      await currentCommand.tearDown();
    }
  } catch(err) {
    console.error(err);
  } finally {
    process.exit(code);
  }
}

async function run() {
  commands = await requireCommands();
  let [,, configPath, commandArg, ...args] = process.argv;
  if (configPath && !commandArg) {
    commandArg = configPath;
    configPath = null;
  }
  let Command = commands.find(Klass => Klass.command === commandArg)
    || UnknownCommand;
  if (!Command.noPath && !configPath) {
    console.log('Missing path argument');
    Command = UnknownCommand;
  }
  let configFile = await buildConfigFilePath(configPath);
  currentCommand = new Command(configFile, args);
  await currentCommand.execute();
}

['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'].forEach(eventType => {
  process.on(eventType, () => cleanExit(0));
});

process.on('unhandledRejection', error => {
  console.error(error);
  cleanExit(1);
});

process.on('exit', cleanExit);

run();
