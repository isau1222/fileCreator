/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var passport = require('passport');
var RememberMeStrategy = require('passport-remember-me').Strategy;
var LocalStrategy = require('passport-local').Strategy;

module.exports.bootstrap = function(done) {

  // == Passport == //

  passport.serializeUser(function(user, next) {
    return next(null, user.id);
  });

  passport.deserializeUser(function(id, next) {
    return sails.models.user.findOne({ id: id }, next);
  });

  // == Passport: Local == //

  passport.use(new LocalStrategy(sails.config.passport.local, verifyLocal));

  function verifyLocal(username, password, next) {
    return sails.models.passport.verifyLocal(username, password, next);
  }

  // == Passport: Remember me == //

  passport.use(new RememberMeStrategy(sails.config.passport.rememberMe, verifyToken, issueToken));

  function issueToken(user, next) {
    return sails.models.passport.issueToken(user, next);
  }

  function verifyToken(token, next) {
    return sails.models.passport.verifyToken(token, next);
  }

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  return done();
};
