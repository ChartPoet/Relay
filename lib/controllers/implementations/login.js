const { Authentication } = require('../../utils/authentication');

class Login extends require('./application').Application {
  static routes() {
    return [
      {
        path: '/login',
        format: 'html',
      },
      {
        path: '/login',
        method: 'post',
        action: 'submit',
      },
    ];
  }
  async main(request, response) {
    this.$hello = 'world';
  }
  async submit(request, response) {
    const userAccessKey = request.body.access_key;
    const accessKey = await Authentication.accessKey();
    if (userAccessKey === accessKey) {
      request.session.hasAccess = true;
    } else {
      request.session = null;
    }
    this.redirected = true;
    response.redirect('/');
  }
}

module.exports.Login = Login;
