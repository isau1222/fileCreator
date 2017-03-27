/**
 * AuthController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');

// @ASSERT: this function does not throw/reject
function makeSessionPayload(req) {
  var user = req.user || null;
  var access = sails.services.access.makeAclPayload(user);

  return Promise.all([user, access])
    .then(function(all) {
      return {
        isAuthenticated: req.isAuthenticated(),
        user: all[0],
        access: all[1],
      };
    });
}

module.exports = {

  login: function(req, res) {

    // @TODO: log security event

    if (req.isAuthenticated()) {
      return makeSessionPayload(req).then(function(payload) {
        return res.apiBadRequest('Already authenticated', payload);
      });
    }

    return passport.authenticate('local', function(err, user, challenge) {
      if (err) {
        // @TODO: log security incident
        return makeSessionPayload(req).then(function(payload) {
          return res.apiBadRequest('Authentication failed', payload, { $error: err });
        });
      }

      else if (!user) {
        // @TODO: log security incident, include challenge
        var message = challenge ? challenge.message : 'Authentication failed';
        return makeSessionPayload(req).then(function(payload) {
          return res.apiBadRequest(message, payload);
        });
      }

      else {
        return req.login(user, function(err) {
          if (err) {
            // @TODO: log security incident
            return makeSessionPayload(req).then(function(payload) {
              return res.apiBadRequest('Authentication failed', payload, { $error: err });
            });
          }

          else {
            return sails.models.passport.issueToken(user, function(err, token) {
              if (err) {
                // @TODO: log security incident
                return makeSessionPayload(req).then(function(payload) {
                  return res.apiBadRequest('Authentication failed', payload, { $error: err });
                });
              }

              else {
                // @TODO: send user info
                // @TODO: log security event
                res.cookie(sails.config.passport.rememberMe.key, token, { path: '/', httpOnly: true, maxAge: 604800000 });
                return makeSessionPayload(req).then(function(payload) {
                  return res.apiOk(payload);
                });
              }
            });
          }
        });
      }
    })(req, res, function(err) {
      // @NOTE: normally we don't arrive here
      // @TODO: log application incident
      return res.apiServerError(err);
    });
  },

  logout: function(req, res) {
    // @TODO: log security event

    if (!req.isAuthenticated()) {
      // @TODO: log security incident
      return makeSessionPayload(req).then(function(payload) {
        return res.apiBadRequest('Not authenticated yet', payload);
      });
    }

    else {
      req.logout();

      var key = sails.config.passport.rememberMe.key;
      var token = req.cookies[key];

      if (!token) {
        // @TODO: log security event
        return makeSessionPayload(req).then(function(payload) {
          return res.apiOk(payload);
        });
      }

      if (token) {
        return sails.models.passport.destroy({ token: token }, function(err) {
          if (err) {
            // @TODO: log security incident
            return makeSessionPayload(req).then(function(payload) {
              return res.apiBadRequest('Deauthentification failed', payload, { $error: err });
            });
          }

          else {
            // @TODO: log security event
            res.clearCookie(key);
            return makeSessionPayload(req).then(function(payload) {
              return res.apiOk(payload);
            });
          }
        });
      }
    }
  },

  status: function(req, res) {
    return makeSessionPayload(req).then(function(payload) {
      return res.apiOk(payload);
    });
  },
};
