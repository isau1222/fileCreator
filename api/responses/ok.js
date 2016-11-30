/**
 * 200 (OK) Response
 *
 * Usage:
 * return res.ok();
 * return res.ok(data);
 * return res.ok(data, details);
 *
 * @param  {Any} data
 *          - Main data to send.
 * @param  {Any} details
 *          - Details about the request, including:
 *            - {Any} signals -- application-wide signals to the client
 *            - {Any} $context -- debug info, only sent in development mode
 */

module.exports = function ok(data, details) {
  return sails.services.responses.jsonOk(this.req, this.res, data, details, {
    status: 200,
    message: 'OK',
  });
};
