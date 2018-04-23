const _ = require('lodash');
const shortid = require('shortid');

const  { Application } = require('../application/application');
const createModel = (schema) => {
  class Model {
    constructor() {
      this._id = shortid() + shortid() + shortid();
      this._model = schema.modelName;
      for (const property in schema.fields) {
        if (schema.fields.hasOwnProperty(property)) {
          this[property] = schema.fields[property].default || null;
        }
      }
    }

    static async db() {
      return Application.getInstance().service('database').databaseInstance();
    }

    async save() {
      console.log('Will save this', this.pojo());
      const pojo = this.pojo();
      let preExistingDocument = await Model.findOne({
        _id: pojo._id,
      });
      if (_.isNil(preExistingDocument)) {
        await Model.insert(pojo);
      } else {
        const _id = pojo._id;
        delete pojo._id;
        await Model.update({ _id }, pojo);
      }
      return this;
    }

    async update() {
    }

    async destroy() {
    }
    static async update(query, document) {
      const db = await Model.db();
      return new Promise((resolve, reject) => {
        db.update(query, document, (err, doc) => {
          if (err) {
            return reject(err);
          }
          return resolve(doc);
        });
      });
    }
    static async insert(document) {
      const db = await Model.db();
      return new Promise((resolve, reject) => {
        db.insert(document, (err, doc) => {
          if (err) {
            return reject(err);
          }
          return resolve(doc);
        });
      });
    }
    static async findOne(params) {
      const db = await Model.db();
      return new Promise((resolve, reject) => {
        db.findOne(params, (err, doc) => {
          if (err) {
            return reject(err);
          }
          return resolve(doc);
        });
      });
    }
    static async find(params) {

    }
    static async findOne(params) {

    }
    pojo() {
      const obj = {};
      for (const property in this) {
        if (this.hasOwnProperty(property)) {
          if (this[property]) {
            obj[property] = this[property];
          }
        }
      }
      return obj;
    }
  }
  return Model;
};
class ModelSchema {
  constructor(modelName, fields) {
    if (_.isNil(modelName) || _.isNil(fields)) {
      throw new Error('modelName and fields are required while create a mongoose schema');
    }
    this.modelName = modelName;
    this.fields = fields;
  }


  addDefaultValues() {
    for (const property in this.fields) {
      if (this.fields.hasOwnProperty(property)) {
        this.fields[property].default = this.fields[property].default || null;
      }
    }
  }
  getModel() {
    this.addDefaultValues();
    const Model = createModel(this);
    this.attachClassNameMethod(Model);
    return Model;
  }

  attachClassNameMethod(Model) {
    Model.prototype.className = function () { //eslint-disable-line
      return this.__proto__.constructor.name;
    };
  }
}

module.exports.ModelSchema = ModelSchema;
