var path = require('path');
var webpack = require('webpack');
var merge = require('webpack-merge');

var ExtractTextPlugin = require('extract-text-webpack-plugin');

var SAILS_ROOT = path.resolve(__dirname, '../..');

module.exports = function(sails) {
  return {
    initialize: function(done) {
      return sails.after(['hook:orm:loaded', 'hook:pubsub:loaded'], function() {
        var config = sails.config.assets;

        // @TODO: refactor into a bundler

        if (config.compile === 'skip') {
          return done();
        }

        if (config.compile !== 'once') {
          return done(new Error('Unknown assets `compile` option value: ' + config.compile));
        }

        var baseWpConfig = {
          // @NOTE: entries are defined in the sails config
          module: {
            rules: [
              {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                  fallback: 'style-loader',
                  use: {
                    loader: 'css-loader',
                    options: {
                      sourceMap: !!config.wpConfig.devtool,
                      minimize: !!config.uglify,
                    },
                  },
                }),
              },
            ],
          },
          plugins: _.compact([
            new ExtractTextPlugin(config.cssFilename),
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
            return 'imports-loader?module=>undefined,exports=>undefined,define=>undefined,require=>undefined,this=>window!' + entry;
          }

          return entry;
        }

        if (Array.isArray(wpConfig.entry)) {
          wpConfig.entry = wpConfig.entry.map(transformEntry);
        }
        else if (_.isString(wpConfig.entry)) {
          wpConfig.entry = transformEntry(wpConfig.entry);
        }

        // @NOTE: overrides can not change public paths and bundle filename and paths

        var wpConfigOverride = {
          module: {
            rules: [
              {
                test: /\.(png|jpg|woff|woff2|eot|ttf|svg|ico)(\?[a-z0-9=.]+)?$/,
                // @NOTE: file-loader does not appear to respect the public path, so we prepend it manually
                use: {
                  loader: 'file-loader',
                  options: {
                    name: '[path][name].[ext]?[hash]',
                    publicPath: wpConfig.output.publicPath,
                  },
                },
              },
            ],
          },
        };

        wpConfig = merge.smart(wpConfig, wpConfigOverride);

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
      });
    },
  };
};
