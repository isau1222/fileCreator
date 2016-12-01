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

module.exports = function forbidden(message, data, details) {
  return sails.services.responses.jsonError(this.req, this.res, message, data, details, {
    status: 403,
    message: 'Forbidden',
    log: function(err) {
      // @TODO: log security incident
    },
  });
};

