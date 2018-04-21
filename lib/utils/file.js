const fs = require('fs');

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
}

module.exports.File = File;
