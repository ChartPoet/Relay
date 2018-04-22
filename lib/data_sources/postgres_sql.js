const _ = require('lodash');
const knex = require('knex');

class PostgresSql extends require('./data_source').DataSource {
  constructor() {
    super();
    this.connection = null;
  }
  async initialize(connectionParams) {
    this.connectionParams = connectionParams;
    this.connection = knex({
      client: 'pg',
      connection: {
        host: connectionParams.host,
        user: connectionParams.user,
        password: connectionParams.password,
        database: connectionParams.database,
      },
    });
  }
  async query(params) {
    const result = await this.connection.raw(params.query);
    if (_.isNil(result.fields) || _.isNil(result.rows)) {
      throw new Error('fields missing from results');
    }
    const columns = _.map(result.fields, (field) => {
      const column = {
        id: field.name,
        name: field.name,
        data_type: 'STRING',
      };
      column.values = _.map(result.rows, row => row[field.name]);
      return column;
    });
    return { columns };
  }
  async getTableColumns(tableName) {
    const query = `SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${tableName}'`;
    const results = await this.connection.raw(query);

    if (_.isNil(results) || _.isNil(results.rows)) {
      return [];
    }
    return _.map(results.rows, columnResult => ({
      name: columnResult.column_name,
      type: columnResult.data_type,
    }));
  }
  async schema() {
    const tables = [];
    const query = "SELECT tablename FROM pg_tables WHERE schemaname='public'";
    const results = await this.connection.raw(query);
    if (_.isNil(results) || _.isNil(results.rows)) {
      return tables;
    }
    for (const row of results.rows) {
      const name = row.tablename;
      if (_.isNil(name)) {
        continue;
      }
      if (_.includes(['schema_migrations', 'ar_internal_metadata'], name)) {
        continue;
      }
      const table = {
        name,
        columns: await this.getTableColumns(name),
      };
      tables.push(table);
    }
    return { tables };
  }
}

module.exports.PostgresSql = PostgresSql;
