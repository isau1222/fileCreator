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
    var context = { url: req.url }; // @TODO: session info

    return sails.services.webapp.render(context, function(err, result) {
      if (err) {
        return res.send(500, 'Internal server error');
      }

      else {
        return res.send(result.status, result.body);
      }
    });
  },
};
