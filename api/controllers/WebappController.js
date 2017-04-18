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
    rest: false,
  },

  render: function(req, res) {
    var context = { req: req, sails: sails };

    return sails.hooks.webapp.render(context, function(err) {
      if (err) {
        if (err instanceof Error) {
          return res.negotiate(err);
        }
        else {
          // @NOTE: there is no dedicated API to cancel the rendering,
          //        so sometimes we throw for different reasons (e.g. redirect)
          // @TODO: document types of throwable objects
          if (err.type === 'redirect') {
            return res.redirect(err.path);
          }
          else {
            // @TODO: log app error
            return res.serverError(err);
          }
        }
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
