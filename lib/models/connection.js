const { ModelSchema } = require('./model_schema');

const connectionSchema = new ModelSchema('Connection', {
  uniqueId: { type: String },
  category: { type: String },
  user: { type: String },
  password: { type: String },
  host: { type: String },
  port: { type: String },
  database: { type: String },
});


class Connection extends connectionSchema.getModel() {
}


module.exports.Connection = Connection;

