const { Initializer } = require('../../initializers/initializer');
const os = require('os');
const AuthenticationUtils = require('../../utils/authentication').Authentication;

class Authentication extends Initializer {
  async run() {
    console.log('PUNE', 'authentication intiializer');
    await AuthenticationUtils.ensureAccessKey();
  }
}
module.exports.Authentication = Authentication;
