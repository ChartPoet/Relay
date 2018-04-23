const { ModelSchema } = require('./model_schema');

const userSchema = new ModelSchema('User', {
  username: { type: String },
  encrypted_password: { type: String },
});

// userSchema.validatesPresenceOf(['username', 'encrypted_password']);

class User extends userSchema.getModel() {
  static login(request, user) {
    return new Promise((resolve, reject) => {
      request.logIn(user, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }
}


module.exports.User = User;

