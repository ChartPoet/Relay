const _ = require('lodash');
const upperCamelCase = require('uppercamelcase');
const { expect } = require('chai');

class DataSource {
  static async query(dataSource, connectionParams, queryParams) {
    const dataSourceInstance = DataSource.getDataSourceInstanceByName(dataSource);
    await dataSourceInstance.query(connectionParams, queryParams);
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
    this.connection.destroy();
  }
}
module.exports.DataSource = DataSource;
