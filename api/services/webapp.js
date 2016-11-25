var Bundler = require('../../webapp/bundler');

var bundler = new Bundler(sails.config.webapp, {
  processSoftError: function(err) {
    sails.log.error(err);
  },
  processServerStats: function(stats) {
    sails.log.debug('Server bundle stats:\n' + stats.toString(true));
  },
  processClientStats: function(stats) {
    sails.log.debug('Client bundle stats:\n' + stats.toString(true));
  },
});

module.exports = {

  init: function(done) {
    return bundler.init(done);
  },

  render: function(context, done) {
    return bundler.render(context, done);
  },

};
