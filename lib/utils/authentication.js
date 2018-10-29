const _ = require('lodash');
const shortid = require('shortid');
const os = require('os');
const { File } = require('./file');

class Authentication {
  static async accessKeyFile() {
    const homeDirectory = os.homedir();
    const file = `${homeDirectory}/.chartpoet.key`;
    return file;
  }
  static async ensureAccessKey() {
    console.log('PUNE', 'ensuring access key');
    const accessKeyFile = await Authentication.accessKeyFile();
    const accessKeyFileExists = await File.exists(accessKeyFile);
    let populate = false;
    if (accessKeyFileExists === false) {
      populate = true;
    } else {
      let contents = await File.read(accessKeyFile);
      contents = contents.trim();
      if (_.isEmpty(contents)) {
        populate = true;
      }
    }

    if (populate === true) {
      await Authentication.populateAccessKey();
    }
  }
  static async populateAccessKey() {
    const keyFile = await Authentication.accessKeyFile();
    const key = shortid.generate() + shortid.generate();
    await File.write(keyFile, key);
  }

  static async accessKey() {
    const keyFile = await Authentication.accessKeyFile();
    let contents = await File.read(keyFile);
    contents = contents.trim();
    if (_.isEmpty(contents)) {
      throw new Error('access key not found');
    }
    return contents;
  }
}

module.exports.Authentication = Authentication;
