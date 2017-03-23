var Bundler = require('../../webapp/bundler');

module.exports = function(sails) {
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

  return {
    initialize: function(done) {
      return sails.after(['hook:orm:loaded', 'hook:pubsub:loaded'], function() {
        return bundler.init(done);
      });
    },
    render: bundler.render.bind(bundler),
  };
};
