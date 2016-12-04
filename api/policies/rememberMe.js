/**
 * rememberMe
 *
 * @module      :: Policy
 * @description :: Tries to remember the user.
 */

var passport = require('passport');

module.exports = function(req, res, next) {
  if (req.isAuthenticated()) {
    // @NOTE: nothing really to log
    return next();
  }

  var key = sails.config.passport.rememberMe.key;
  var token = req.cookies[key];

  if (!token) {
    // @NOTE: nothing really to log
    return next();
  }

  return passport.authenticate('remember-me', function(err, user, challenge) {
    // @NOTE: if authentication has failed, then there's no point in:
    //        - doing logoing, because user was not logged in from the start
    //        - manually removing cookies, because this is done by the passport

    if (err) {
      // @TODO: log security incident, token was present but authentication failed
      return res.badRequest(err);
    }

    else if (!user) {
      // @TODO: log security incident
      var message = challenge ? challenge.message : 'Authentication failed';
      return res.badRequest(message);
    }

    else {
      return req.login(user, function(err) {
        if (err) {
          // @TODO: log security incident
          return res.badRequest(err);
        }

        else {
          // @TODO: log security event
          return next(null, 'what');
        }
      });
    }
  })(req, res, function(err) {
    if (err) {
      // @TODO: log application incident
      return res.serverError(err);
    }

    else {
      return next();
    }
  });
};
