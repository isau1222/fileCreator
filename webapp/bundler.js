var fs = require('fs');
var path = require('path');
var url = require('url');
var async = require('async');
var lodash = require('lodash');
var assimilateError = require('assimilate-error');

var webpack = require('webpack');
var merge = require('webpack-merge');
var VueSsrPlugin = require('vue-ssr-webpack-plugin');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var createBundleRenderer = require('vue-server-renderer').createBundleRenderer;

function noop() {
  // @NOTE: no operation
}

// @NOTE: utility function to extract first error from the webpack stats
function extractWebpackError(stats) {
  var details = stats.toJson();
  var errors = details.errors; // @NOTE: this is a list of messages, not a list of actual errors

  // @NOTE: filter out stack, because it's useless
  var message = errors[0]
    .split('\n')
    .filter(function(line) {
      return !line.includes('    at ');
    })
    .join('\n');

  // @NOTE: convert to proper error
  return new Error(message);
}

// === //

module.exports = Bundler;

function Bundler(config, opts) {
  if (opts === undefined) opts = {};
  if (opts.processSoftError === undefined) opts.processSoftError = noop;
  if (opts.processServerStats === undefined) opts.processServerStats = noop;
  if (opts.processClientStats === undefined) opts.processClientStats = noop;
  if (opts.delayWatch === undefined) opts.delayWatch = function(next) {
    // @NOTE: no delay by default
    return next();
  };

  this.config = config;
  this.opts = opts;
  this.blocks = {};

  var baseWpConfig = {
    module: {
      rules: _.compact([
        {
          test: /\.vue$/,
          use: {
            loader: 'vue-loader',
            options: {
              loaders: {
                js: this.config.transpile ? 'babel-loader' : '',

                // @REFERENCE: https://github.com/vuejs/vue-loader/blob/v11.0.0/docs/en/configurations/pre-processors.md#sass-loader-caveat
                scss: ['vue-style-loader', 'css-loader', 'sass-loader'], // <style lang="scss">
                sass: ['vue-style-loader', 'css-loader', 'sass-loader?indentedSyntax'], // <style lang="sass">
              },
            },
          },
        },
        this.config.transpile && {
          test: /\.js/,
          exclude: /node_modules/,
          use: 'babel-loader',
        },
      ]),
    },
    resolve: {
      extensions: ['.js', '.json', '.vue'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
        'vue': this.config.runtimeBuild
          ? 'vue/dist/vue.runtime.common.js'
          : 'vue/dist/vue.common.js',
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Vue: 'vue',
        Vuex: 'vuex',
        VueRouter: 'vue-router',
        _: 'lodash',
        App: '@/app',
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(this.config.NODE_ENV),
        'process.env.APP_ID': JSON.stringify(this.config.appId),
        'process.env.APP_PUBLIC_PATH': JSON.stringify(this.config.publicPath),
        'process.env.APP_API_PUBLIC_PATH': JSON.stringify(this.config.apiPublicPath),
      }),
    ],
  };

  var serverWpConfig, clientWpConfig;

  if (this.config.ssrEnabled) {
    serverWpConfig = merge.smart(baseWpConfig, this.config.server);
    this.serverPath = path.join(serverWpConfig.output.path, this.config.serverBundleName);
  }

  clientWpConfig = merge.smart(baseWpConfig, this.config.client);

  this.publicBundlePath = url.resolve(clientWpConfig.output.publicPath, clientWpConfig.output.filename);
  this.publicVendorPath = url.resolve(clientWpConfig.output.publicPath, this.config.vendorFilename);

  // @NOTE: overrides can not change public paths and bundle filename and paths

  var fileLoaderTest = /\.(png|jpg|woff|woff2|eot|ttf|svg|ico)(\?[a-z0-9=.]+)?$/;
  var fileLoaderOptions = {
    name: '[path][name].[ext]?[hash]',
    publicPath: clientWpConfig.output.publicPath,
  };

  var serverWpConfigOverride, clientWpConfigOverride;

  if (this.config.ssrEnabled) {
    serverWpConfigOverride = {
      module: {
        rules: [
          {
            test: fileLoaderTest,
            use: {
              loader: 'file-loader',
              options: Object.assign({}, fileLoaderOptions, {
                emitFile: false,
              }),
            },
          },
        ],
      },
      resolve: {
        mainFields: ['main'], // @NOTE: prefer `require` over `import`, see [https://webpack.js.org/configuration/resolve/#resolve-mainfields]
      },
      target: 'node', // Necessary for Vue bundle renderer
      output: {
        libraryTarget: 'commonjs2', // Necessary for Vue bundle renderer
      },
      plugins: lodash.compact([
        new webpack.DefinePlugin({
          'process.env.VUE_ENV': JSON.stringify('server'),
        }),
        // @NOTE: it is necessary for the server bundle to be a single file
        new webpack.optimize.LimitChunkCountPlugin({
          maxChunks: 1,
        }),
        new VueSsrPlugin({
          filename: this.config.serverBundleName,
        }),
        new ProgressBarPlugin(),
      ]),
    };
  }

  clientWpConfigOverride = {
    module: {
      rules: [
        {
          test: fileLoaderTest,
          use: {
            loader: 'file-loader',
            options: fileLoaderOptions,
          },
        },
        {
          test: /\.scss$/,
          // @FIXME: minify css for production
          use: [
            'style-loader',
            'css-loader',
            'sass-loader',
          ],
        },
      ],
    },
    resolve: {
      mainFields: ['browser', 'main'], // @NOTE: prefer `require` over `import`, see [https://webpack.js.org/configuration/resolve/#resolve-mainfields]
    },
    plugins: lodash.compact([
      new webpack.DefinePlugin({
        'process.env.VUE_ENV': JSON.stringify('client'),
      }),
      // @NOTE: extracts vendor chunk
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: this.config.vendorFilename,
      }),
      this.config.uglify && new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
      new ProgressBarPlugin(),
    ]),
    output: {
      devtoolModuleFilenameTemplate: 'webpack-src:///[resource-path]',
      devtoolFallbackModuleFilenameTemplate: 'webpack-src:///[resource-path]',
    },
  };

  if (this.config.ssrEnabled) {
    serverWpConfig = merge.smart(serverWpConfig, serverWpConfigOverride);
  }

  clientWpConfig = merge.smart(clientWpConfig, clientWpConfigOverride);

  // @NOTE: for some reason the instantiations of webpack can not be separated
  //        and intertwined with `merge.smart`, it throws bundling error if attempted

  if (this.config.ssrEnabled) {
    this.serverCompiler = webpack(serverWpConfig);
  }

  this.clientCompiler = webpack(clientWpConfig);

  this.renderer = null;
}

Bundler.prototype.init = function(done) {
  if (this.config.compile === 'skip') {
    return this._initWithSkipCompile(done);
  }

  if (this.config.compile === 'once') {
    return this._initWithOnceCompile(done);
  }

  else if (this.config.compile === 'watch') {
    return this._initWithWatchCompile(done);
  }

  else {
    return done(new Error('Unknown webapp `compile` option value: ' + this.config.compile));
  }
};

Bundler.prototype.render = function(context, done) {
  var bundler = this;

  Promise.resolve()
    .then(function() {
      return bundler._waitAll();
    })
    .then(function() {
      if (!bundler.config.ssrEnabled) {
        // @NOTE: if we skip rendering, we want to fill the context with basic body and status code,
        //        otherwise Vue won't know where to initialize
        context.body = '<div id="' + bundler.config.appId + '"></div>';
        context.status = 200;
        return;
      }

      // @TODO: block if client or server bundle are not ready
      if (bundler.renderer === null) {
        throw new Error('Renderer is not ready');
      }

      return new Promise(function(resolve, reject) {
        return bundler.renderer.renderToString(context, function(err, body) {
          if (err) {
            // @NOTE: If there is a runtime error, this branch will execute.
            //        Unfortunately, the stack trace will not give reasonable
            //        filename and line number, but it's better then nothing

            // @NOTE: we need to assimilate error because bundler is run in the vm,
            //        so the errors will be foreign
            err = assimilateError(err);

            // @NOTE: if it's a regular error, then report it
            if (err instanceof Error) {
              bundler.opts.processSoftError(err);
            }

            // @NOTE: There is no dedicated API to cancel the rendering,
            //        so sometimes we throw for different reasons (e.g. redirect).
            //        If that's not one of these cases, then report the error
            // @TODO: Document types of throwable objects
            var acceptableThrowableTypes = ['redirect'];
            if (!acceptableThrowableTypes.includes(err.type)) {
              bundler.opts.processSoftError(err);
            }

            return reject(err);
          }

          if (context.status == null) {
            return reject(new Error('Renderer did not return a status code'));
          }

          context.body = body;

          return resolve();
        });
      });
    })
    .then(function() {
      context.includeScripts = [
        bundler.publicVendorPath,
        bundler.publicBundlePath,
      ];
      return done();
    })
    .catch(function(err) {
      return done(err);
    });

};

Bundler.prototype._initWithSkipCompile = function(done) {
  var bundler = this;

  if (bundler.config.ssrEnabled) {
    bundler._setPending('server-renderer');

    bundler._updateRenderer(function(err) {
      if (err) {
        bundler._reject('server-renderer', err);
        return bundler.opts.processSoftError(err);
      }

      bundler._resolve('server-renderer');
    });
  }

  bundler._setPending('client-renderer');
  bundler._resolve('client-renderer');

  bundler._waitAll()
    .then(function(result) {
      return done(null, result);
    })
    .catch(function(err) {
      return done(err);
    });
};

Bundler.prototype._initWithOnceCompile = function(done) {
  var bundler = this;

  if (bundler.config.ssrEnabled) {
    bundler._setPending('server-renderer');

    bundler.serverCompiler.run(function(err, stats) {
      if (err) return bundler._reject('server-renderer', err);

      // @NOTE: in `once` mode, server should fail to start if bundling has failed
      if (stats.hasErrors()) {
        return bundler._reject('server-renderer', extractWebpackError(stats));
      }

      return bundler._updateRenderer(function(err2) {
        if (err2) {
          bundler._reject('server-renderer', err2);
          return bundler.opts.processSoftError(err2);
        }

        bundler.opts.processServerStats(stats);
        bundler._resolve('server-renderer');
      });
    });
  }

  bundler._setPending('client-renderer');

  bundler.clientCompiler.run(function(err, stats) {
    if (err) return bundler._reject('client-renderer', err);

    // @NOTE: in `once` mode, server should fail to start if bundling has failed
    if (stats.hasErrors()) {
      return bundler._reject('client-renderer', extractWebpackError(stats));
    }

    bundler.opts.processClientStats(stats);
    bundler._resolve('client-renderer');
  });

  bundler._waitAll()
    .then(function(result) {
      return done(null, result);
    })
    .catch(function(err) {
      return done(err);
    });
};

Bundler.prototype._initWithWatchCompile = function(done) {
  var bundler = this;

  bundler.opts.delayWatch(function() {
    if (bundler.config.ssrEnabled) {
      bundler.serverCompiler.plugin('compile', function() {
        bundler._setPending('server-renderer');
        bundler._invalidateRenderer();
      });

      bundler.serverCompiler.watch({}, function(err, stats) {
        if (err) {
          bundler._reject('server-renderer', err);
          return bundler.opts.processSoftError(err);
        }

        if (stats.hasErrors()) {
          var err2 = extractWebpackError(stats);
          bundler._reject('server-renderer', err2);
          return bundler.opts.processSoftError(err2);
        }

        return bundler._updateRenderer(function(err3) {
          if (err3) {
            bundler._reject('server-renderer', err3);
            return bundler.opts.processSoftError(err3);
          }

          bundler.opts.processServerStats(stats);
          bundler._resolve('server-renderer');
        });
      });
    }

    bundler.clientCompiler.plugin('compile', function() {
      bundler._setPending('client-renderer');
    });

    bundler.clientCompiler.watch({}, function(err, stats) {
      if (err) {
        bundler._reject('client-renderer', err);
        return bundler.opts.processSoftError(err);
      }

      if (stats.hasErrors()) {
        var err2 = extractWebpackError(stats);
        bundler._reject('client-renderer', err2);
        return bundler.opts.processSoftError(err2);
      }

      bundler.opts.processClientStats(stats);
      bundler._resolve('client-renderer');
    });
  });

  // @NOTE: we don't actually wait for the bundle to compile
  return done();
};

// === //

Bundler.prototype._setPending = function(key) {
  var resolve, reject;
  var promise = new Promise(function(_resolve, _reject) {
    resolve = _resolve;
    reject = _reject;
  });

  promise.catch(function(err) {
    // @NOTE: this is necessary to avoid "unhandled promise rejection" error
  });

  this.blocks[key] = {
    promise: promise,
    resolve: resolve,
    reject: reject,
  };
};

Bundler.prototype._resolve = function(key, value) {
  this.blocks[key].resolve(value);
};

Bundler.prototype._reject = function(key, err) {
  this.blocks[key].reject(err);
};

Bundler.prototype._waitAll = function() {
  var bundler = this;

  var promises = [];
  Object.keys(this.blocks)
    .forEach(function(key) {
      promises.push(bundler.blocks[key].promise);
    });

  return Promise.all(promises);
};

// === //

Bundler.prototype._invalidateRenderer = function() {
  this.renderer = null;
};

Bundler.prototype._updateRenderer = function(done) {
  var bundler = this;

  return fs.readFile(bundler.serverPath, 'utf-8', function(err, bundleJson) {
    if (err) return done(err);

    try {
      var bundle = JSON.parse(bundleJson);
      bundler.renderer = createBundleRenderer(bundle, {
        // @TODO: component caching
      });
      return done();
    }
    catch (err) {
      return done(err);
    }
  });
};
