const _ = require('lodash');
const shortid = require('shortid');
const { DataSource } = require('../../data_sources/data_source');
const { Connection } = require('../../models/connection');

class Home extends require('./application').Application {
  skipCsrf() {
    return true;
  }
  static routes() {
    return [
      {
        path: '/',
        format: 'html',
      },
      {
        path: '/connection/new',
        format: 'html',
        action: 'newConnection',
      },
      {
        path: '/connection/submit',
        format: 'html',
        action: 'submitConnection',
        method: 'post',
      },
      {
        path: '/schema',
        format: 'json',
        action: 'schema',
        method: 'post',
      },
      {
        path: '/query',
        format: 'json',
        action: 'query',
        method: 'post',
      },
    ];
  }
  async main(request, response) {
    await this.authFilter(request, response);
    this.$connections = await Connection.find();
    this.$hello = 'world';
  }
  async newConnection(request, response) {
    await this.authFilter(request, response);
    this.$connection = new Connection();
    this.$connectionErrors = {};
  }
  async submitConnection(request, response) {
    await this.authFilter(request, response);
    console.log(request.body.new.connection);
    this.$connection = new Connection(request.body.new.connection);
    this.$connection.uniqueId = shortid.generate() + shortid.generate();
    this.$connectionErrors = {};
    await this.$connection.save();
    this.redirected = true;
    response.redirect('/');
  }
  async schema(request, response) {
    const connection = await Connection.findOne({
      uniqueId: request.body.uniqueId,
    });
    if (_.isNil(connection)) {
      throw new Error('No such connection');
    }
    connection.database = request.body.database;
    this.$schema = await DataSource.schema(connection.category, connection);
  }

  async query(request, response) {
    const connection = await Connection.findOne({
      uniqueId: request.body.uniqueId,
    });
    if (_.isNil(connection)) {
      throw new Error('No such connection');
    }
    connection.database = request.body.database;
    this.$results = await DataSource.query(connection.category, connection, {
      query: request.body.query,
    });
  }
}

module.exports.Home = Home;
