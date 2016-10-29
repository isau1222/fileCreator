/**
 * 500 (Server Error) Handler
 *
 * Usage:
 * return res.serverError();
 * return res.serverError(err);
 * return res.serverError(err, data);
 * return res.serverError(err, data, details);
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
  res.status(500);

  if (!err) err = new Error('Server error');

  // @TODO: log application incident

  // Only include errors in response if application environment
  // is not set to 'production'.  In production, we shouldn't
  // send back any identifying information about errors.
  if (sails.config.environment === 'production' && sails.config.keepResponseErrors !== true) {
    return res.json({
      message: err.message,
      data: data,
    });
  }
  else {
    return res.json({
      message: err.message,
      data: data,
      details: details,
      stack: err.stack,
    });
  }
};

