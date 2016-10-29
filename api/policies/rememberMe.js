/**
 * rememberMe
 *
 * @module      :: Policy
 * @description :: Tries to authenticate the user from the request.
 */

var passport = require('passport');

module.exports = function(req, res, next) {
  if (req.isAuthenticated()) return next();

  // Retrieve token from the request
  var key = sails.config.passport.rememberme.key;
  var token = req.cookies[key];

  if (!token) return next();

  // Verify token
  return passport.authenticate('remember-me', function(err, user, info) {
    if (err || !user) {
      // @TODO: log security incident, token was present but authentication failed
      return passport.logout(req, res, next);
    }
    return passport.login(req, res, user, next);
  })(req, res, next);
};
