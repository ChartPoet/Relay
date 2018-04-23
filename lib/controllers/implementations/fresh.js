class Fresh extends require('../controller.js').Controller {
  static routes() {
    return [
      {
        path: '/fresh',
      },
    ];
  }
  async main(request, response) {
    this.$hello = 'world';
  }
}

module.exports.Fresh = Fresh;
