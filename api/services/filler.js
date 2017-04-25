module.exports = {
  init: function(done) {
    if (!sails.config.filler.enabled) return done();

    Promise.resolve()
      .then(function() {
        var query = { username: sails.config.filler.adminUsername };
        var record = { username: sails.config.filler.adminUsername };
        return sails.models.user.findOrCreate(query, record);
      })
      .then(function(admin) {
        var query = { user: admin.id, strategy: 'local' };
        var record = {
          user: admin.id,
          strategy: 'local',
          password: sails.config.filler.adminPassword,
        };
        return sails.models.passport.findOrCreate(query, record);
      })
      .then(function() {
        return done();
      })
      .catch(function(err) {
        return done(err);
      });
  },
};
