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
    var context = { url: req.url, sails: sails };

    return sails.services.webapp.render(context, function(err, result) {
      if (err) {
        console.log(err); // @FIXME: proper logging
        return res.send(500, 'Internal server error');
      }

      else {
        return res.send(result.status, result.body);
      }
    });
  },
};
