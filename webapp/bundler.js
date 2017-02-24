var fs = require('fs');
var path = require('path');
var url = require('url');
var he = require('he');
var async = require('async');
var lodash = require('lodash');

var webpack = require('webpack');
var merge = require('webpack-merge');
var VueSsrPlugin = require('vue-ssr-webpack-plugin');
var createBundleRenderer = require('vue-server-renderer').createBundleRenderer;

function noop() {
  // @NOTE: no operation
}


// @DOCS: a utility function to assimilate an error, originated from the virtual machine evaluation context
function assimilateError(err) {
  // @NOTE: if it is a regulare error, then pass
  if (err instanceof Error) {
    return err;
  }

  var Constructor = err && err.__proto__ && err.__proto__.constructor;

  // @NOTE: if it does not have a constructor, then pass
  if (!Constructor) {
    return err;
  }

  // @NOTE: if constructor does not look like an error constructor, then pass
  if (!Constructor.name.endsWith('Error')) {
    return err;
  }

  // @NOTE: resistance is futile

  var AssimilatedConstructor = global[Constructor.name];
  var error = new AssimilatedConstructor(err.message);

  var keys = Object.keys(err);
  var fields = ['stack', 'code', 'errno', 'syscall'].concat(keys);

  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (err[field]) {
      error[field] = err[field];
    }
  }

  return error;
}

// === //

module.exports = Bundler;

function Bundler(config, opts) {
  if (opts === undefined) opts = {};
  if (opts.processSoftError === undefined) opts.processSoftError = noop;
  if (opts.processServerStats === undefined) opts.processServerStats = noop;
  if (opts.processClientStats === undefined) opts.processClientStats = noop;

  this.config = config;
  this.opts = opts;

  var baseWpConfig = {
    module: {
      loaders: [
        // @NOTE: necessary because webpack does not support .json files out of box
        { test: /\.json$/, loader: 'json' },
        { test: /\.vue$/, loader: 'vue' },
      ],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    plugins: [
      new webpack.ProvidePlugin({
        Vue: 'vue',
        Vuex: 'vuex',
        VueRouter: 'vue-router',
      }),
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(this.config.NODE_ENV),
        'process.env.APP_PUBLIC_PATH': JSON.stringify(this.config.publicPath),
        'process.env.APP_API_PUBLIC_PATH': JSON.stringify(this.config.apiPublicPath),
      }),
    ],
  };

  var serverWpConfig = merge.smart(baseWpConfig, this.config.server);
  var clientWpConfig = merge.smart(baseWpConfig, this.config.client);

  this.serverPath = path.join(serverWpConfig.output.path, this.config.serverBundleName);

  this.publicBundlePath = url.resolve(clientWpConfig.output.publicPath, clientWpConfig.output.filename);
  this.publicVendorPath = url.resolve(clientWpConfig.output.publicPath, this.config.vendorFilename);

  // @NOTE: overrides can not change public paths and bundle filename and paths

  var fileLoaderTest = /\.(png|jpg|woff|woff2|eot|ttf|svg|ico)(\?[a-z0-9=.]+)?$/;
  var fileLoaderQuery = 'file-loader?name=[path][name].[ext]?[hash]&publicPath=' + clientWpConfig.output.publicPath;

  var serverWpConfigOverride = {
    module: {
      loaders: [
        {
          test: fileLoaderTest,
          loader: fileLoaderQuery + '&emitFile=false',
        },
      ],
    },
    target: 'node', // Necessary for Vue bundle renderer
    output: {
      libraryTarget: 'commonjs2', // Necessary for Vue bundle renderer
    },
    plugins: lodash.compact([
      // @NOTE: it is necessary for the server bundle to be a single file
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      new VueSsrPlugin({
        filename: this.config.serverBundleName,
      }),
    ]),
  };

  var clientWpConfigOverride = {
    module: {
      loaders: [
        {
          test: fileLoaderTest,
          loader: fileLoaderQuery,
        },
      ],
    },
    plugins: lodash.compact([
      // @NOTE: extracts vendor chunk
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: this.config.vendorFilename,
      }),
      // @NOTE: uglifyJs appears to minify css too
      this.config.uglify && new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
    ]),
    output: {
      devtoolModuleFilenameTemplate: 'webpack-src:///[resource-path]',
      devtoolFallbackModuleFilenameTemplate: 'webpack-src:///[resource-path]',
    },
  };

  if (this.config.vueAlias) {
    clientWpConfigOverride.resolve = {
      alias: {
        vue: this.config.vueAlias,
      },
    };
  }

  serverWpConfig = merge.smart(serverWpConfig, serverWpConfigOverride);
  clientWpConfig = merge.smart(clientWpConfig, clientWpConfigOverride);

  this.serverCompiler = webpack(serverWpConfig);
  this.clientCompiler = webpack(clientWpConfig);

  this.renderer = null;
}

Bundler.prototype.init = function(done) {
  if (this.config.compile === 'once') {
    return this._initWithOnceCompile(done);
  }

  else if (this.config.compile === 'watch') {
    return this._initWithWatchCompile(done);
  }

  else {
    return done(new Error('Unknown `compile` option value'));
  }
};

Bundler.prototype.render = function(context, done) {
  var bundler = this;

  if (bundler.renderer === null) {
    return done(new Error('Renderer is not ready'));
  }

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

      return done(err);
    }

    if (context.status == null) {
      return done(new Error('Renderer did not return a status code'));
    }

    context.body = body;
    context.includeScripts = [
      bundler.publicVendorPath,
      bundler.publicBundlePath,
    ];

    return done();
  });
};

Bundler.prototype._initWithOnceCompile = function(done) {
  var bundler = this;

  return async.parallel([
    function(next) {
      return bundler.serverCompiler.run(function(err, stats) {
        if (err) return next(err);

        // @NOTE: in `once` mode, server should fail to start if bundling has failed
        if (stats.hasErrors()) {
          return next(new Error('Bundling failed: ' + stats.toString('errors-only')));
        }

        bundler.opts.processServerStats(stats);

        return bundler._updateRenderer(next);
      });
    },
    function(next) {
      return bundler.clientCompiler.run(function(err, stats) {
        if (err) return next(err);

        // @NOTE: in `once` mode, server should fail to start if bundling has failed
        if (stats.hasErrors()) {
          return next(new Error('Bundling failed: ' + stats.toString('errors-only')));
        }

        bundler.opts.processClientStats(stats);

        return next();
      });
    },
  ], done);
};

Bundler.prototype._initWithWatchCompile = function(done) {
  var bundler = this;

  bundler.serverCompiler.plugin('compile', function() {
    bundler._invalidateRenderer();
  });

  bundler.serverCompiler.watch({}, function(err, stats) {
    if (err) return bundler.opts.processSoftError(err);

    bundler.opts.processServerStats(stats);

    if (stats.hasErrors()) {
      return bundler.opts.processSoftError(new Error('Server bundle contains errors'));
    }

    return bundler._updateRenderer(function(err) {
      if (err) return bundler.opts.processSoftError(err);
    });
  });

  bundler.clientCompiler.watch({}, function(err, stats) {
    if (err) return bundler.opts.processSoftError(err);

    bundler.opts.processClientStats(stats);

    if (stats.hasErrors()) {
      return bundler.opts.processSoftError(new Error('Client bundle contains errors'));
    }
  });

  // @NOTE: we don't actually wait for the bundle to compile
  return done();
};

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
    catch(err) {
      return done(err);
    }
  });
};
