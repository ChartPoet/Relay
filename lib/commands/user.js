const _ = require('lodash');
const UserModel = require('../models/user').User;
class User extends require('./command').Command {
  async run() {
    await this.application.initializeServices([
      'database',
    ]);
    const action = this.commandLineOptions._.shift();
    if (_.isNil(action)) {
      console.log('Please specify an action for user command');
      return;
    }
    await this[action]();

    return { exit: 0 };
  }
  async add() {
    console.log('Adding user');
    const user = new UserModel();
    console.log('User', user);
    user.username = 'admin';
    user.encrypted_password = 'admin';
    await user.save();
  }
}

module.exports.User = User;
