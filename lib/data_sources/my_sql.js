const _ = require('lodash');
const knex = require('knex');

class MySql extends require('./data_source').DataSource {
  constructor() {
    super();
    this.connection = null;
  }
  async initialize(connectionParams) {
    this.connectionParams = connectionParams;
    this.connection = knex({
      client: 'mysql2',
      connection: {
        host: connectionParams.host,
        user: connectionParams.user,
        port: connectionParams.port || 3306,
        password: connectionParams.password,
        database: connectionParams.database,
      },
    });
  }
  async query(params) {
    const result = await this.connection.raw(params.query);
    if (result.length < 2) {
      throw new Error('invalid response');
    }
    const fields = result[1];
    const rows = result[0];
    if (_.isNil(fields) || _.isNil(rows)) {
      throw new Error('fields or rows missing from results');
    }
    const columns = _.map(fields, (field) => {
      const column = {
        id: field.name,
        name: field.name,
        data_type: 'STRING',
      };
      column.values = _.map(rows, row => row[field.name]);
      return column;
    });
    return { columns };
  }
  async getTableColumns(tableName) {
    const query = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = '${this.connectionParams.database}' AND TABLE_NAME = '${tableName}'`;
    const results = await this.connection.raw(query);
    if (_.isNil(results) || results.length === 0) {
      return [];
    }
    return _.map(results[0], columnResult => ({
      name: columnResult.COLUMN_NAME,
      type: columnResult.COLUMN_TYPE,
    }));
  }
  async schema() {
    const tables = [];
    const results = await this.connection.raw(`SELECT * FROM information_schema.tables where table_schema = '${this.connectionParams.database}'`);
    if (_.isNil(results) || results.length === 0) {
      return tables;
    }
    for (const tableResult of results[0]) {
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
