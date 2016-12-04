/**
 * WebappController
 *
 * @description :: A controller that renders the webapp page using SSR.
 */

module.exports = {
  _config: {
    actions: false,
    shortcuts: false,
    rest: false
  },

  render: function(req, res) {
    var context = { req: req, sails: sails };

    return sails.services.webapp.render(context, function(err, result) {
      if (err) {
        return res.negotiate(err);
      }

      else {
        return res.send(result.status, result.body);
      }
    });
  },
};
