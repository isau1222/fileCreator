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
    // res.type('text/html; charset=utf-8'); // @NOTE: probably needed for stream
    res.send('<p>@TODO: Render ' + req.url + '</p><pre>');
  },
};
