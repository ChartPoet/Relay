const _ = require('lodash');
const bcrypt = require('bcrypt');

class Hash {
  static bcrypt(plainText, saltIterations, callback) {
    if (_.isFunction(saltIterations)) {
      callback = saltIterations; //eslint-disable-line
      saltIterations = 10; //eslint-disable-line
    }
    bcrypt.hash(plainText, saltIterations, callback);
  }

  static bcryptAwait(plainText) {
    return new Promise((resolve, reject) => {
      Hash.bcrypt(plainText, (err, value) => {
        if (err) {
          return reject(err);
        }
        return resolve(value);
      });
    });
  }

  static compareBcrypt(plainText, hash, callback) {
    bcrypt.compare(plainText, hash, callback);
  }
}

module.exports.Hash = Hash;
