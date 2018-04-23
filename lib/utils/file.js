const _ = require('lodash');
const fs = require('fs');
const path = require('path');
const upperCamelCase = require('uppercamelcase');

class File {
  static async stat(file) {
    return new Promise((resolve, reject) => {
      fs.stat(file, (err, stat) => {
        if (err) {
          return reject(err);
        }
        return resolve(stat);
      });
    });
  }
  static async exists(file) {
    try {
      await File.stat(file);
      return true;
    } catch (err) {
      return false;
    }
  }

  static async validClassesFromDirectory(directory) {
    return new Promise((resolve, reject) => {
      File.validClassesFromDirectoryViaCallback(directory, (err, classes) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(classes);
      });
    });
  }
  static validClassesFromDirectoryViaCallback(directory, callback) {
    fs.readdir(directory, (err, files) => {
      let classes = _.map(files, (fileName) => {
        if (/^\..*/.test(fileName)) {
          return null;
        }
        const baseFileName = path.parse(fileName).name;
        const Class = require(`${directory}/${fileName}`)[upperCamelCase(baseFileName)]; //eslint-disable-line
        return Class;
      });
      classes = _.compact(classes);
      return callback(null, classes);
    });
  }
}

module.exports.File = File;
