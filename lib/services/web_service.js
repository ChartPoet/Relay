const upperCamelCase = require('uppercamelcase');
const fs = require('fs');
const path = require('path');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const csrf = require('csurf');
const _ = require('lodash');
const shortid = require('shortid');
const chalk = require('chalk');
const { File } = require('../utils/file');
/**
 * Web Service
 */
class Route {
  constructor(Controller, option) {
    this.Controller = Controller;
    this.path = option.path;
    this.format = option.mime || 'json';
    this.method = option.method || 'get';
    this.action = option.action || 'main';
  }
  invoke(request, response, next) {
    const { Controller } = this;
    const controllerInstance = new Controller();
    if (!_.isFunction(controllerInstance[this.action])) {
      return next(`${this.action} not found in ${this.Controller.name}`);
    }
    controllerInstance[this.action](request, response)
      .then(() => {
        controllerInstance.renderResponse(request, response, next);
      })
      .catch(err => next(err));
  }
}
class WebService extends require('./service').Service {
  requiredServices() {
    return ['database'];
  }

  async setupWebApplication() {
    // create web application using express
    this.webApplication = express();
    this.webApplication.use(cookieParser());
    const secretKey  = shortid() + shortid() + shortid();
    const sessionName = 'chartpoet-relay-server-session';
    this.webApplication.use(cookieSession({
      name: sessionName,
      secret: secretKey,
    }));
    this.webApplication.use(morgan('combined'));
    const bodyParserPayload = {
      limit: '4mb',
    };
    this.webApplication
      .use(bodyParser.json(bodyParserPayload))
      .use(bodyParser.urlencoded({ extended: false }))
      .use(compression());
    const staticFilesDirectory = path.resolve(
      this.application.root(),
      this.application.configuration.value('staticDirectory', 'public'),
    );
    this.webApplication.use(express.static(staticFilesDirectory));
    this.webApplication.use(csrf({ cookie: true }));
  }
  async initialize(options) {
    await this.setupWebApplication(options);
  }
  async setupRoutes() {
    const controllerImplementationsDir = path.resolve(__dirname, '../controllers/implementations');
    const controllerClasses = await File.validClassesFromDirectory(controllerImplementationsDir);
    console.log('controllerClasses are', controllerClasses);
    _.map(controllerClasses, (Controller) => {
      _.map(Controller.routes(), (routeOptions) => {
        const route = new Route(Controller, routeOptions);
        this.webApplication[route.method.toLowerCase()](route.path, function(request, response, next) {
          route.invoke(request, response, next);
        });
      });
    });
  }
  getWebApplication() {
    return this.webApplication;
  }

  async start() {
    const port = parseInt(this.application.configuration.value('port', '7777'), 10);
    await this.setupRoutes();
    console.log('Starting web server');
    return new Promise((resolve, reject) => {
      this.webApplication.listen(port, (errWebApplication) => { // eslint-disable-line
        if (errWebApplication) {
          return reject(errWebApplication);
        }
        console.log(chalk.green(`Http Server listening at ${port}`));
      });
    });
  }
}

module.exports.WebService = WebService;
