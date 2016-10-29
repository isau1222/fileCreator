/**
 * sessionAuth
 *
 * @module      :: Policy
 * @description :: Requires the user to be authenticated with passport.
 */

module.exports = function(req, res, next) {
  if (req.isAuthenticated()) return next();

  return res.forbidden(new Error('You are not permitted to perform this action'));
};
