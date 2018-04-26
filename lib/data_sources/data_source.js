const _ = require('lodash');
const upperCamelCase = require('uppercamelcase');

class DataSource {
  static async query(dataSource, connectionParams, queryParams) {
    if (_.isNil(dataSource)) {
      throw new Error('dataSource not provided');
    }
    if (_.isNil(connectionParams)) {
      throw new Error('connectionParams not provided');
    }
    if (_.isNil(queryParams)) {
      throw new Error('queryParams not provided');
    }
    const dataSourceInstance = DataSource.getDataSourceInstanceByName(dataSource);
    await dataSourceInstance.initialize(connectionParams);
    let results = null;
    let error = null;
    try {
      results = await dataSourceInstance.query(queryParams);
    } catch (err) {
      error = err;
    }

    await dataSourceInstance.close();
    if (error) {
      throw new Error(error);
    }
    return results;
  }
  static async schema(dataSource, connectionParams) {
    if (_.isNil(dataSource)) {
      throw new Error('dataSource not provided');
    }
    if (_.isNil(connectionParams)) {
      throw new Error('connectionParams not provided');
    }
    const dataSourceInstance = DataSource.getDataSourceInstanceByName(dataSource);
    await dataSourceInstance.initialize(connectionParams);
    const schema = await dataSourceInstance.schema();
    await dataSourceInstance.close();
    return schema;
  }
  static getDataSourceInstanceByName(name) {
    const klassName = upperCamelCase(name);
    const Klass = require(`./${_.snakeCase(name)}`)[klassName];
    return new Klass();
  }
  async query(connectionParams, queryParams) {
    throw new Error('Not implemented');
  }
  async schema(connectionParams, queryParams) {
    throw new Error('Not implemented');
  }
  async close() {
    await this.connection.destroy();
  }
  maxResults() {
    return 5000;
  }
}
module.exports.DataSource = DataSource;
