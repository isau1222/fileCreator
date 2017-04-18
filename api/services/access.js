module.exports = {

  makeAclPayload: function(user) {
    // @BL: user.roles
    var roles = user && user.roles ? user.roles : ['guest'];

    // @BL: access
    return sails.models.access.find({ role: roles })
      .then(function(entries) {
        return _(entries)
          .groupBy('context')
          .mapValues(function(entries) {
            return _(entries)
              .map('action')
              .uniq()
              .value();
          })
          .value();
      })
      .catch(function(err) {
        // @TODO: log application failure
        console.error(err);
        // @NOTE: we must not fail the promise, so we have to return an empty list
        return {};
      });
  },

  authorize: function(user, action, context) {
    // @BL: user.roles
    var roles = user && user.roles ? user.roles : ['guest'];

    return sails.models.access.findOne({ role: roles, action: action, context: context })
      .then(function(access) {
        if (!access) {
          // @TODO: log security event
          return false;
        }
        else {
          // @TODO: log security event
          return true;
        }
      })
      .catch(function(err) {
        // @TODO: log security error
        return false;
      });
  },

};
