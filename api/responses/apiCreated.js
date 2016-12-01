/**
 * 201 (CREATED) Response
 *
 * Usage:
 * return res.created();
 * return res.created(data);
 * return res.created(data, details);
 *
 * @param  {Any} data
 *          - Data to send along the `err.message`.
 * @param  {Any} details
 *          - Details about the request, will NOT be sent to user.
 */

module.exports = function created(data, details) {
  return sails.services.responses.jsonOk(this.req, this.res, data, details, {
    status: 201,
    message: 'Created',
  });
};
