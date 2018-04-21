const _ = require('lodash');

class Configuration {
  constructor(opts) {
    let options = opts;
    if (_.isNil(options)) {
      options = {};
    }
    this.application = options.application;
    this.configObject = opts;
  }


  value(keyPath, defaultValue) {
    return _.get(this.configObject, keyPath, defaultValue);
  }
}

module.exports.Configuration = Configuration;
