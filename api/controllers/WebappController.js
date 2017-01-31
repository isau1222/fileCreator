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

        if (context.includeScripts == null) {
          context.includeScripts = [];
        }

        if (context.includeStyles == null) {
          context.includeStyles = [];
        }

        context.includeScripts = [assetsJsPublicPath].concat(context.includeScripts);
        context.includeStyles = [assetsCssPublicPath].concat(context.includeStyles);

        res.status(context.status);
        return res.view('webapp', {
          layout: null,
          context: context,
        });
      }
    });
  },
};
