const _ = require('lodash');
const formic = require('formic');
const path = require('path');
const { View } = require('../views/view');
const { cleanPathUrl } = require('../utils/helper');
const { Route } = require('../routes/route');
/**
 * Base class for all controllers
 */
class Controller {
  /**
   * creates an instance of controller
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */
  constructor(options) {
    const self = this;
    if (_.isNil(options)) {
      options = {}; // eslint-disable-line
    }

    /*
      set up internal variables from passed options
     */
    Object.keys(options).forEach((key) => {
      this[key] = options[key];
    });

    self.internalVariablePrefix = self.internalVariablePrefix || '$';
    this.defaultLayout = 'application';
  }

  static routes() {
    return [];
  }

  /**
   * get a json consisting of all view variables
   * view variables are the variables that will be available to the views while rendering
   * view variables start with @ and has a single @
   * @return {[type]}
   */
  getViewVariables() {
    const self = this;
    let keys = Object.keys(this);
    keys = _.filter(keys, (key) => { // eslint-disable-line
      return key.startsWith(self.internalVariablePrefix);
    });

    // pick view variables and leave internal variables of type @__xxx
    const viewVariables = {};

    for (var key of keys) { // eslint-disable-line
      viewVariables[key] = this[key];
    }

    return viewVariables;
  }

  /**
   * returns json object to be used while rendering views
   * @return {Object}
   */
  getJson() {
    const key = 'json';
    if (!_.isNil(this[key])) {
      return this[key];
    }
    return this.getViewVariables();
  }

  renderTemplatizedView(request, response, next) {
    const variables = _.extend({
      request,
      response,
      controller: this.controller,
      action: this.action,
    }, this.getViewVariables());
    variables.formFor = (object) => {
      const formFor = new formic.FormFor(object);
      formFor.hidden('utf8', '✓');
      // formFor.hidden('_csrf', request.csrfToken());
      return formFor;
    };
    let { layout } = this;
    if (_.isUndefined(layout)) {
      layout = this.controllerLayout();
    }
    if (_.isUndefined(layout)) {
      layout = this.defaultLayout;
    }
    let layoutFile = cleanPathUrl(`app/views/layouts/${layout}`);
    if (_.isNil(layout)) {
      layoutFile = null;
    }
    const controllerName = _.snakeCase(this.constructor.name);
    const action = _.snakeCase(this.action);
    const templateFile = cleanPathUrl(`app/views/${controllerName}/${action}`);
    const appRoot = path.resolve(this.application.root(), './lib');
    let { format } = this;
    format = format || this.props.format || 'html';
    const view = new View({
      layoutFile,
      templateFile,
      variables,
      appRoot,
      format,
    });
    return view.render((renderError, renderedView) => {
      if (renderError) {
        return next(renderError);
      }
      const mimeObject = Route.getMimeObject(format);
      return this.writeResponse(
        {
          payload: renderedView,
          content_type: mimeObject.content_type,
        },
        request,
        response,
        next,
      );
    });
  }

  renderResponse(request, response, next) {
    const format = this.format || 'json';
    const mimeObject = Route.getMimeObject(format);
    if (_.isNil(mimeObject)) {
      const errorObject = {
        code: 400,
        payload: `Unrecognized format ${format}`,
      };
      return this.sendError(errorObject, request, response, next);
    }
    if (mimeObject.template === true) {
      return this.renderTemplatizedView(request, response, next);
    } else { //eslint-disable-line
      const renderedObject = JSON.stringify(this.getJson());
      return this.writeResponse(
        {
          payload: renderedObject,
          content_type: mimeObject.content_type,
          noResponse: this.noResponse,
        },
        request,
        response,
        next,
      );
    }
  }

  sendError(errorObject, request, response, next) {  // eslint-disable-line
    response.status(errorObject.code || 500);
    response.set('Content-Type', errorObject.content_type || 'text/plain; charset=utf-8');
    response.send(errorObject.payload);
    return next(null);
  }

  writeResponse(responseObject, request, response, next) {
    if (responseObject.noResponse === true) {
      return;
    }
    response.status(responseObject.code || this.response_code || 200);
    response.header('Content-Type', responseObject.content_type);
    response.send(responseObject.payload);
  }

  controllerLayout() {
    return undefined;
  }
}


module.exports.Controller = Controller;
