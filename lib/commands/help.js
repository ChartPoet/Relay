class Help extends require('./command').Command {
  async run() {
    console.log('Print help here');
  }
}

module.exports.Help = Help;
