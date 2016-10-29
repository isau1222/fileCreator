/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 * return res.ok(data, details);
 *
 * @param  {Any} data
 *          - Data to send along the `err.message`.
 * @param  {Any} details
 *          - Details about the request, will NOT be sent to user.
 */

module.exports = function ok(data, details) {
  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;

  // @TODO: log metrics

  // Set status code
  res.status(200);

  // Only include errors in response if application environment
  // is not set to 'production'.  In production, we shouldn't
  // send back any identifying information about errors.
  if (sails.config.environment === 'production' && sails.config.keepResponseErrors !== true) {
    return res.json({
      data: data,
    });
  }
  else {
    return res.json({
      data: data,
      details: details,
    });
  }
};
