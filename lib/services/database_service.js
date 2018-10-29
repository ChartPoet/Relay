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
    let file = path.resolve(this.application.homeDir(), `./${baseFileName}`);
    await this.loadDatabase(file);
  }
  databaseInstance() {
    return this.db;
  }
  async initialize(options) { // eslint-disable-line
    await this.initDatabase();
  }

  async start(options){ // eslint-disable-line
    throw new Error('Not Implemented');
  }
}

module.exports.DatabaseService = DatabaseService;
