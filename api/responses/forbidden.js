/**
 * 403 (Forbidden) Handler
 *
 * Usage:
 * return res.forbidden();
 * return res.forbidden(err);
 * return res.forbidden(err, data);
 * return res.forbidden(err, data, details);
 *
 * @param  {Error} err
 *          - What has caused a failure.
              Note, then `err.message` will be sent to the user.
 * @param  {Any} data
 *          - Data to send along the `err.message`.
 * @param  {Any} details
 *          - Details about the failure, will NOT be sent to user.
 */

module.exports = function forbidden(err, data, details) {
  // Get access to `req`, `res`
  var req = this.req;
  var res = this.res;

  // Set status code
  res.status(403);

  // @TODO: log security incident

  // Only include errors in response if application environment
  // is not set to 'production'.  In production, we shouldn't
  // send back any identifying information about errors.
  if (sails.config.environment === 'production' && sails.config.keepResponseErrors !== true) {
    return res.json({
      message: err ? err.message : undefined,
      data: data,
    });
  }
  else {
    return res.json({
      message: err ? err.message : undefined,
      data: data,
      details: details,
      stack: err ? err.stack : undefined,
    });
  }
};

