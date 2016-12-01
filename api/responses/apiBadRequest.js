/**
 * 400 (Bad Request) Handler
 *
 * Usage:
 * return res.badRequest();
 * return res.badRequest(err);
 * return res.badRequest(err, data);
 * return res.badRequest(err, data, details);
 *
 * @param  {Error} err
 *          - What has caused a failure.
              Note, then `err.message` will be sent to the user.
 * @param  {Any} data
 *          - Data to send along the `err.message`.
 * @param  {Any} details
 *          - Details about the failure, will NOT be sent to user.
 */

module.exports = function badRequest(message, data, details) {
  return sails.services.responses.jsonError(this.req, this.res, message, data, details, {
    status: 400,
    message: 'Bad Request',
    log: function(err) {
      // @TODO: log application event
    },
  });
};
