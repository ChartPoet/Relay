const _ = require('lodash');

class Route {
  constructor(Controller, option, application) {
    this.Controller = Controller;
    this.path = option.path;
    this.format = option.format || 'json';
    this.method = option.method || 'get';
    this.action = option.action || 'main';
    this.application = application;
  }
  invoke(request, response, next) {
    const { Controller } = this;
    const controllerInstance = new Controller({
      format: this.format,
      action: this.action,
      application: this.application,
    });
    if (!_.isFunction(controllerInstance[this.action])) {
      return next(`${this.action} not found in ${this.Controller.name}`);
    }
    controllerInstance[this.action](request, response)
      .then(() => {
        if (controllerInstance.redirected === true) {
          return;
        }
        controllerInstance.renderResponse(request, response, next);
      })
      .catch(err => next(err));
  }
  static mimeTypes() {
    return [
      {
        template: true,
        extensions: ['html', 'htm'],
        content_type: 'text/html; charset=utf-8',
      },
      {
        template: true,
        extensions: ['text', 'txt'],
        content_type: 'text/plain; charset=utf-8',
      },
      {
        template: false,
        extensions: ['js', 'json'],
        content_type: 'application/json',
      },
      {
        template: true,
        extensions: ['csv'],
        content_type: 'text/csv; charset=utf-8',
      },
      {
        template: true,
        extensions: ['xml'],
        content_type: 'application/xml',
      },
      {
        template: true,
        extensions: ['rss'],
        content_type: 'application/rss+xml',
      },
      {
        template: true,
        extensions: ['atom'],
        content_type: 'application/atom+xml',
      },
      {
        template: false,
        extensions: ['yaml'],
        content_type: 'text/x-yaml; charset=utf-8',
      },
    ];
  }

  static getMimeObject(format) { // eslint-disable-line
    return _.find(Route.mimeTypes(), (mimeType) => {
      const extension = _.find(mimeType.extensions, (ext) => { // eslint-disable-line
        return ext.toLowerCase() === format.toLowerCase();
      });
      return !_.isNil(extension);
    });
  }
}
module.exports.Route = Route;
