class Application extends require('../controller').Controller {
  async authFilter(request, response) {
    console.log('in auth filter');
    console.log(request.session);
    if (request.session.hasAccess !== true) {
      this.redirected = true;
      console.log('redireting');
      response.redirect('/login');
    }
  }
}

module.exports.Application = Application;
