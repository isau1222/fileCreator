/**
 * AuthController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var passport = require('passport');

module.exports = {

  login: function(req, res) {
    // @TODO: log security event

    if (req.isAuthenticated()) {
      // @TODO: log security incident
      return res.apiBadRequest(new Error('Already authenticated'));
    }

    return passport.authenticate('local', function(err, user, challenges) {
      if (err) {
        // @TODO: log security incident
        return res.apiBadRequest(err);
      }

      else if (!user) {
        // @TODO: log security incident, include challenges
        return res.apiBadRequest(new Error('Authentication failed'), undefined, challenges ? { challenges: challenges } : undefined);
      }

      else {
        return req.login(user, function(err) {
          if (err) {
            // @TODO: log security incident
            return res.apiBadRequest(err);
          }

          else {
            return sails.models.passport.issueToken(user, function(err, token) {
              if (err) {
                // @TODO: log security incident
                return res.apiBadRequest(err);
              }

              else {
                // @TODO: send user info
                // @TODO: log security event
                res.cookie(sails.config.passport.rememberMe.key, token, { path: '/', httpOnly: true, maxAge: 604800000 });
                return res.apiOk();
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
      return res.apiBadRequest(new Error('Not authenticated yet'));
    }

    else {
      req.logout();

      var key = sails.config.passport.rememberMe.key;
      var token = req.cookies[key];

      if (!token) {
        // @TODO: log security event
        return res.apiOk();
      }

      if (token) {
        return sails.models.passport.destroy({ token: token }, function(err) {
          if (err) {
            // @TODO: log security incident
            return res.apiBadRequest(err);
          }

          else {
            // @TODO: log security event
            res.clearCookie(key);
            return res.apiOk();
          }
        });
      }
    }
  },

  status: function(req, res) {
    return res.apiOk({
      authenticated: req.isAuthenticated(),
      session: req.session,
      user: req.user,
    });
  },
};
