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

  return passport.authenticate('remember-me', function(err, user) {
    if (err) {
      // @TODO: log server error
      return res.serverError(err, undefined, { $context: { note: 'Remember startegy is misbehaving, expected it to never land here' } });
    }

    else if (!user) {
      // @TODO: log server error
      return res.serverError('Authentication failed', undefined, { $context: { note: 'Remember startegy is misbehaving, expected it to never land here' } });
    }

    else {
      return req.login(user, function(err) {
        if (err) {
          // @TODO: log server error
          return res.serverError(err);
        }

        else {
          // @TODO: log security event
          return res.redirect(307, req.url); // @NOTE: with 307 client MUST NOT change the request method
          // @NOTE: `next` would have been called here if we didn't redirect
        }
      });
    }
  })(req, res, function(err) {
    // @NOTE: we land here when authentication attempt failed, e.g. malformed
    //        or invalid token
    // @NOTE: there's no point in:
    //        - rejecting the user, because remember-me is a convinience,
    //          not a requirement
    //        - doing logout, because user was not logged in from the start
    //        - manually removing cookies, because this is done by the remember
    //          strategy

    if (err) {
      // @TODO: log application incident
      return res.serverError(err);
    }

    else {
      return next();
    }
  });
};
