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

module.exports = function forbidden(message, data, details) {
  return sails.services.responses.jsonError(this.req, this.res, message, data, details, {
    status: 500,
    message: 'Server error',
    log: function(err) {
      // @TODO: log application incident
    },
  });
};

