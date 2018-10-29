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
    let columns = null;
    let error = null;
    try {
      columns = await dataSourceInstance.query(queryParams);
      for (const column of columns) {
        column.dataType = DataSource.getDataTypeFromValues(column.values) || column.dataType || 'STRING';
      }
    } catch (err) {
      error = err;
    }
    await dataSourceInstance.close();
    if (error) {
      throw new Error(error);
    }
    return { columns };
  }

  static getDataType(string) {
    const value = (string || '').toString();
    const nan = _.isNaN(Number(value));
    const isfloat = /^\d*(\.|,)\d*$/;
    const commaFloat = /^(\d{0,3}(,)?)+\.\d*$/;
    const dotFloat = /^(\d{0,3}(\.)?)+,\d*$/;
    const date = /^\d{0,4}(\.|\/)\d{0,4}(\.|\/)\d{0,4}$/;
    if (!nan) {
      if (parseFloat(value) === parseInt(value, 10)) {
        return 'INTEGER';
      }
      return 'FLOAT';
    } else if (isfloat.test(value) || commaFloat.test(value) || dotFloat.test(value)) {
      return 'FLOAT';
    } else if (!_.isNaN(Date.parse(value))) {
      return 'DATE';
    }
    return 'STRING';
  }
  static getDataTypeFromValues(values) {
    if (_.isEmpty(values)) {
      return null;
    }
    const dataTypes = _.map(_.uniq(_.compact(values)), (value) => {
      try {
        return DataSource.getDataType(value);
      } catch (err) {
        return 'STRING';
      }
    });
    return _.head(_(dataTypes)
      .countBy()
      .entries()
      .maxBy('[1]'));
  }
  static async schema(dataSource, connectionParams) {
    if (_.isNil(dataSource)) {
      throw new Error('dataSource not provided');
    }
    if (_.isNil(connectionParams)) {
      throw new Error('connectionParams not provided');
    }
    connectionParams.user = connectionParams.user || connectionParams.username;
    console.log(dataSource);
    console.log(connectionParams);
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
