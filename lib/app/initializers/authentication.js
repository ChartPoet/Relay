const { Initializer } = require('../../initializers/initializer');
const os = require('os');
const AuthenticationUtils = require('../../utils/authentication').Authentication;

class Authentication extends Initializer {
  async run() {
    await AuthenticationUtils.ensureAccessKey();
  }
}
module.exports.Authentication = Authentication;
