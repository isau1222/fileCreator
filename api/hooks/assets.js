var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

var SAILS_ROOT = path.resolve(__dirname, '../..');

module.exports = function(sails) {
  return {
    initialize: function(done) {
        var config = sails.config.assets;

        var baseWpConfig = {
          // @NOTE: entries are defined in the sails config
          module: {
            loaders: [
              {
                test: /\.css$/,
                loader: ExtractTextPlugin.extract(
                  'style-loader',
                  config.wpConfig.devtool ? 'css-loader?sourceMap' : 'css-loader' // @NOTE: in production we don't want sourcemaps
                ),
              },
              {
                test: /\.(png|jpg|woff|woff2|eot|ttf|svg|ico)(\?[a-z0-9=.]+)?$/,
                loader: 'file-loader?name=[path][name].[ext]?[hash]',
              },
            ],
          },
          plugins: _.compact([
            new ExtractTextPlugin(config.cssFilename),
            // @NOTE: uglifyJs appears to minify css too
            config.uglify && new webpack.optimize.UglifyJsPlugin({
              compress: {
                warnings: false,
              },
            }),
          ]),
          output: {
            devtoolModuleFilenameTemplate: 'webpack-assets:///[resource-path]',
            devtoolFallbackModuleFilenameTemplate: 'webpack-assets:///[resource-path]',
          },
        };

        var wpConfig = merge.smart(baseWpConfig, config.wpConfig);

        var scriptTest = /\.js$/;
        function transformEntry(entry) {
          // @NOTE: we can not do that in the `module.loaders` of webpack config,
          //        because otherwise it would be applied to all js modules,
          //        not just entries, and things would break

          // @NOTE: at first this was done with script-loader, but it caused
          //        even more suffering with minification and sourcemaps
          // @NOTE: script-loader was replaced with more simple
          //        imports-loader, but was commented out instead of being
          //        removed, because it may be neccessary to bring it back

          // // @NOTE: apply script-loader to all js entry modules
          // // @NOTE: this is needed because otherwise scripts will be loaded
          // //        as node modules, and UMD-style scrits may break
          // if (scriptTest.test(entry)) {
          //   return 'script-loader!' + entry;
          // }

          // @NOTE: apply imports-loader to all js entry modules, shimming
          //        out all node-related globals
          // @NOTE: this is needed because otherwise smartypants libraries
          //        will think they are running under node,
          //        and will not export globals correctly
          if (scriptTest.test(entry)) {
            return 'imports-loader?module=>undefined,exports=>undefined,define=>undefined,require=>undefined!' + entry;
          }

          return entry;
        }

        if (Array.isArray(wpConfig.entry)) {
          wpConfig.entry = wpConfig.entry.map(transformEntry);
        }
        else if (_.isString(wpConfig.entry)) {
          wpConfig.entry = transformEntry(wpConfig.entry);
        }

        var compiler = webpack(wpConfig);

        compiler.run(function(err, stats) {
          if (err) {
            return done(err);
          }

          sails.log.debug('Asset bundle stats:\n' + stats.toString(true));

          if (stats.hasErrors()) {
            return done(new Error('Bundling failed: ' + stats.toString('errors-only')));
          }

          return done();
        });
    },
  };
};
