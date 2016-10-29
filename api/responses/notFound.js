/**
 * 404 (Not Found) Handler
 *
 * Usage:
 * return res.notFound();
 * return res.notFound(err);
 * return res.notFound(err, data);
 * return res.notFound(err, data, details);
 *
 * @param  {Error} err
 *          - What has caused a failure.
              Note, then `err.message` will be sent to the user.
 * @param  {Any} data
 *          - Data to send along the `err.message`.
 * @param  {Any} details
 *          - Details about the failure, will NOT be sent to user.
 *
 * NOTE:
 * If a request doesn't match any explicit routes (i.e. `config/routes.js`)
 * or route blueprints (i.e. "shadow routes"), Sails will call `res.notFound()`
 * automatically.
 */

module.exports = function notFound(err, data, details) {
  // Get access to `req`, `res`, & `sails`
  var req = this.req;
  var res = this.res;

  // Set status code
  res.status(404);

  if (!err) err = new Error('Not found');

  // @TODO: log application event

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
    })
  }
};

