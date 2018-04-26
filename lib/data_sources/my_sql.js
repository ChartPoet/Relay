const _ = require('lodash');
const mysql = require('mysql');

class MySql extends require('./data_source').DataSource {
  constructor() {
    super();
    this.connection = null;
  }
  async initialize(connectionParams) {
    this.connectionParams = connectionParams;
    this.connection = mysql.createConnection({
      host: connectionParams.host,
      user: connectionParams.user,
      port: connectionParams.port || 3306,
      password: connectionParams.password,
      database: connectionParams.database,
    });
    this.connection.connect();
  }
  streamCb(params, callback) {
    const self = this;
    const results = [];
    let fields = null;
    const query = this.connection.query(params.query);
    query.on('error', (err) => {
      callback(err);
    });
    query.on('fields', (_fields) => {
      fields = _fields;
    });
    query.on('result', (row) => {
      results.push(row);
      if (results.length > self.maxResults()) {
        self.connection.pause();
        callback(null, { fields, results });
      }
    });
    query.on('end', () => callback(null, { fields, results }));
  }
  async streamQuery(params) {
    return new Promise((resolve, reject) => {
      this.streamCb(params, (err, results) => {
        if (err) {
          return reject(err);
        }
        return resolve(results);
      });
    });
  }
  async simpleQuery(params) {
    return new Promise((resolve, reject) => {
      this.connection.query(params.query, (error, results, fields) => {
        if (error) {
          return reject(error);
        }
        return resolve({ fields, results });
      });
    });
  }
  async query(params) {
    const { fields, results } = await this.streamQuery(params);
    if (_.isNil(fields) || _.isNil(results)) {
      return [];
    }
    const columns = [];
    _.map(fields, (field) => {
      const column = {
        id: field.name,
        name: field.name,
        data_type: 'STRING',
      };
      column.values = _.map(results, row => row[field.name]);
      columns.push(column);
    });
    return columns;
  }
  async getTableColumns(tableName) {
    const query = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${this.connectionParams.database}' AND TABLE_NAME = '${tableName}'`;
    const { results } = await this.simpleQuery({ query });
    if (_.isNil(results) || results.length === 0) {
      return [];
    }
    return _.map(results, columnResult => ({
      name: columnResult.COLUMN_NAME,
      type: columnResult.COLUMN_TYPE,
    }));
  }
  async schema() {
    const tables = [];
    const { results } = await this.simpleQuery({
      query: `SELECT * FROM information_schema.tables where table_schema = '${this.connectionParams.database}'`,
    });

    if (_.isNil(results) || results.length === 0) {
      return tables;
    }
    for (const tableResult of results) {
      const name = tableResult.TABLE_NAME;
      const table = {
        name,
        columns: await this.getTableColumns(name),
      };
      tables.push(table);
    }
    return { tables };
  }
}

module.exports.MySql = MySql;
