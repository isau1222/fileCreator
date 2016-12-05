/**
 * AuthController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');

function makeSessionPayload(req) {
  return {
    authenticated: req.isAuthenticated(),
    user: req.user || null,
  };
}

module.exports = {

  login: function(req, res) {
    // @TODO: log security event

    if (req.isAuthenticated()) {
      // @TODO: log security incident
      return res.apiBadRequest('Already authenticated', makeSessionPayload(req));
    }

    return passport.authenticate('local', function(err, user, challenge) {
      if (err) {
        // @TODO: log security incident
        return res.apiBadRequest('Authentication failed', makeSessionPayload(req), { $error: err });
      }

      else if (!user) {
        // @TODO: log security incident, include challenge
        var message = challenge ? challenge.message : 'Authentication failed';
        return res.apiBadRequest(message, makeSessionPayload(req));
      }

      else {
        return req.login(user, function(err) {
          if (err) {
            // @TODO: log security incident
            return res.apiBadRequest('Authentication failed', makeSessionPayload(req), { $error: err });
          }

          else {
            return sails.models.passport.issueToken(user, function(err, token) {
              if (err) {
                // @TODO: log security incident
                return res.apiBadRequest('Authentication failed', makeSessionPayload(req), { $error: err });
              }

              else {
                // @TODO: send user info
                // @TODO: log security event
                res.cookie(sails.config.passport.rememberMe.key, token, { path: '/', httpOnly: true, maxAge: 604800000 });
                return res.apiOk(makeSessionPayload(req));
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
      return res.apiBadRequest('Not authenticated yet', makeSessionPayload(req));
    }

    else {
      req.logout();

      var key = sails.config.passport.rememberMe.key;
      var token = req.cookies[key];

      if (!token) {
        // @TODO: log security event
        return res.apiOk(makeSessionPayload(req));
      }

      if (token) {
        return sails.models.passport.destroy({ token: token }, function(err) {
          if (err) {
            // @TODO: log security incident
            return res.apiBadRequest('Deauthentification failed', makeSessionPayload(req), { $error: err });
          }

          else {
            // @TODO: log security event
            res.clearCookie(key);
            return res.apiOk(makeSessionPayload(req));
          }
        });
      }
    }
  },

  status: function(req, res) {
    return res.apiOk(makeSessionPayload(req));
  },
};
