/**
 * WebappController
 *
 * @description :: A controller that renders the webapp page using SSR.
 */
var url = require('url');

module.exports = {
  _config: {
    actions: false,
    shortcuts: false,
    rest: false
  },

  render: function(req, res) {
    var context = { req: req, sails: sails };

    return sails.hooks.webapp.render(context, function(err, result) {
      if (err) {
        return res.negotiate(err);
      }

      else {
        var assetsConfig = sails.config.assets;
        var assetsJsPublicPath = url.resolve(assetsConfig.wpConfig.output.publicPath, assetsConfig.wpConfig.output.filename);
        var assetsCssPublicPath = url.resolve(assetsConfig.wpConfig.output.publicPath, assetsConfig.cssFilename);

        if (context.scripts == null) {
          context.scripts = [];
        }

        if (context.styles == null) {
          context.styles = [];
        }

        context.scripts = [assetsJsPublicPath].concat(context.scripts);
        context.styles = [assetsCssPublicPath].concat(context.styles);

        res.status(context.status);
        return res.view('webapp', {
          layout: null,
          context: context,
        });
      }
    });
  },
};
