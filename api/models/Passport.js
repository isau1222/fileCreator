/**
 * Passport.js
 *
 * @description :: User passport.
 */

var bcrypt = require('bcrypt');
var crypto = require('crypto');

function hashPassword(passport, next) {
  if (passport.password == undefined) {
    return next(null, passport);
  }

  else {
    return bcrypt.hash(passport.password, 10, function(err, hash) {
      delete passport.password;
      passport.hash = hash;
      return next(err, passport);
    });
  }
}

module.exports = {
  attributes: {
    user: {
      model: 'User',
      required: true,
    },

    strategy: {
      type: 'string',
      required: true,
      enum: ['local', 'remember-me'],
    },

    // @NOTE: local strategy
    hash: { type: 'string' },

    // @NOTE: remember-me strategy
    token: { type: 'string' },
  },

  // == Hooks == //

  beforeCreate: function(passport, next) {
    hashPassword(passport, next);
  },

  beforeUpdate: function(passport, next) {
    hashPassword(passport, next);
  },

  // == Methods == //

  /**
   * Verifies user credentials.
   * Intended to be used with passport-local.
   */
  verifyLocal: function(username, password, next) {
    // @TODO: log security event

    var userQuery = { username: username };
    return sails.models.user.findOne(userQuery, function(err, user) {
      if (err) {
        // @TODO: log security incident
        return next(err);
      }

      else if (!user) {
        // @TODO: log security incident
        return next(null, false);
      }

      else {
        var passportQuery = { strategy: 'local', user: user.id };
        return sails.models.passport.findOne(passportQuery, function(err, passport) {
          if (err) {
            // @TODO: log security incident
            return next(err);
          }

          if (!passport) {
            // @TODO: log security incident
            return next(null, false);
          }

          else if (passport.strategy !== 'local') {
            // @TODO: log security incident
            return next(new Error('Wrong strategy'));
          }

          else {
            return bcrypt.compare(password, passport.hash, function(err, valid) {
              if (err) {
                // @TODO: log security incident
                return next(err);
              }

              else if (!valid) {
                // @TODO: log security incident, password validation failed
                return next(null, false);
              }

              else {
                // @TODO: log security event, password validation succeeded
                return next(null, user);
              }
            });
          }
        });
      }
    });
  },

  /**
   * Issues a token to the user.
   * Intended to be used with passport-remember-me.
   */
  issueToken: function(user, next) {
    // @TODO: log security event

    var token = crypto.randomBytes(32).toString('hex');

    var passport = {
      user: user.id,
      strategy: 'remember-me',
      token: token,
    };

    return sails.models.passport.create(passport, function(err) {
      if (err) {
        // @TODO: log security incident
        return next(err);
      }

      else {
        return next(null, token);
      }
    });
  },

  /**
   * Verifies a token, consuming it in the progress, and returns a user.
   * Returns `false` if verification has failed.
   * Intended to be used with passport-remember-me.
   */
  verifyToken: function(token, next) {
    // @TODO: log security event

    var passportQuery = { strategy: 'remember-me', token: token };
    return sails.models.passport.findOne(passportQuery, function(err, passport) {
      if (err) {
        // @TODO: log security incident
        return next(err);
      }

      else if (!passport) {
        // @TODO: log security incident
        return next(null, false);
      }

      else if (passport.strategy !== 'remember-me') {
        // @TODO: log security incident
        return next(new Error('Wrong strategy'));
      }

      else {
        sails.models.user.findOne({ id: passport.user }, function(err, user) {
          if (err) {
            // @TODO: log security incident
            return next(err);
          }

          else if (!user) {
            // @TODO: log security incident
            return next(null, false);
          }

          else {
            return passport.destroy(function(err) {
              if (err) {
                // @TODO: log security incident
                return next(err);
              }

              else {
                // @TODO: log security event, token consumed
                return next(null, user);
              }
            });
          }
        });
      }
    });
  },
};
