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

module.exports = function notFound(message, data, details) {
  return sails.services.responses.jsonError(this.req, this.res, message, data, details, {
    status: 404,
    message: 'Not found',
    log: function(err) {
      // @TODO: log application event
    },
  });
};

