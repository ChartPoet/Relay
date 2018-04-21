const _ = require('lodash');
const NeDB = require('nedb');
const chalk = require('chalk');
const path = require('path');
const { File } = require('../utils/file');
/**
 * Database Service
 */
class DatabaseService {
  constructor(options) {
    this.application = options.application;
    this.db = null;
  }
  requiredServices() {
    return [];
  }
  async loadDatabase(file) {
    this.db = new NeDB({ filename: file, autoload: true });
  }
  async initDatabase() {
    const baseFileName = '.chartpoet.db';
    const fileInCurrentDirectory = path.resolve(this.application.root(), `./${baseFileName}`);
    const globalFile = path.resolve(this.application.homeDir(), `./${baseFileName}`);
    const localFile = this.application.configuration.value('database', fileInCurrentDirectory);
    let file = null;

    if (await File.exists(localFile)) {
      console.log(chalk.green(`Will load database from ${localFile}`));
      file = localFile;
    } else if (await File.exists(globalFile)) {
      console.log(chalk.green(`Will load database from ${globalFile}`));
      file = globalFile;
    }
    if (file === null) {
      console.log(chalk.green('No existing database files found'));
      file = localFile;
      console.log(chalk.green(`Will create new database at ${file}`));
    }
    await this.loadDatabase(file);
  }
  async initialize(options) { // eslint-disable-line
    await this.initDatabase();
  }

  async start(options){ // eslint-disable-line
    throw new Error('Not Implemented');
  }
}

module.exports.DatabaseService = DatabaseService;
