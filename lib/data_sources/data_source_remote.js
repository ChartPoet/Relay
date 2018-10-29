const _ = require('lodash');
const axios = require('axios');
const upperCamelCase = require('uppercamelcase');

class DataSourceRemote {
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
    const columns = [];
    const url = `${connectionParams.relay_url}/query`;
    const payload = {
      uniqueId: connectionParams.relay_key,
      database: connectionParams.database,
    };
    _.extend(payload, queryParams);
    const response = await axios.post(url, payload);
    return response.data.$results;
  }
  static async schema(dataSource, connectionParams) {
    if (_.isNil(dataSource)) {
      throw new Error('dataSource not provided');
    }
    if (_.isNil(connectionParams)) {
      throw new Error('connectionParams not provided');
    }
    const url = `${connectionParams.relay_url}/schema`;
    const payload = {
      uniqueId: connectionParams.relay_key,
      database: connectionParams.database,
    };
    const response = await axios.post(url, payload);
    const schema = response.data.$schema;
    return schema;
  }
}
module.exports.DataSourceRemote = DataSourceRemote;
