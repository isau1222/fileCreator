var fs = require('fs');
var path = require('path');
var url = require('url');
var he = require('he');
var async = require('async');
var lodash = require('lodash');

var webpack = require('webpack');
var merge = require('webpack-merge');
var createBundleRenderer = require('vue-server-renderer').createBundleRenderer;

function getBundlePath(wpConfig) {
  return path.join(wpConfig.output.path, wpConfig.output.filename);
}

function noop() {
  // @NOTE: no operation
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
      ],
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': JSON.stringify(this.config.NODE_ENV),
        'process.env.APP_PUBLIC_PATH': JSON.stringify(this.config.publicPath),
        'process.env.APP_API_PUBLIC_PATH': JSON.stringify(this.config.apiPublicPath),
      }),
    ],
  };

  var serverWpConfigOverride = {
    target: 'node', // Necessary for Vue bundle renderer
    output: {
      libraryTarget: 'commonjs2', // Necessary for Vue bundle renderer
    },
    plugins: lodash.compact([
      // @NOTE: it is necessary for the server bundle to be a single file
      new webpack.optimize.LimitChunkCountPlugin({
        maxChunks: 1,
      }),
      this.config.uglifyJs && new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
    ]),
  };

  var clientWpConfigOverride = {
    plugins: lodash.compact([
      // @NOTE: extracts vendor chunk
      new webpack.optimize.CommonsChunkPlugin({
        name: 'vendor',
        filename: this.config.vendorFilename,
      }),
      this.config.uglifyJs && new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false,
        },
      }),
    ]),
  };

  if (this.config.vueAlias) {
    clientWpConfigOverride.resolve = {
      alias: {
        vue: this.config.vueAlias,
      },
    };
  }

  var serverWpConfig = merge.smart(baseWpConfig, this.config.server, serverWpConfigOverride);
  var clientWpConfig = merge.smart(baseWpConfig, this.config.client, clientWpConfigOverride);

  this.serverCompiler = webpack(serverWpConfig);
  this.clientCompiler = webpack(clientWpConfig);

  this.renderer = null;

  this.serverPath = getBundlePath(serverWpConfig);
  this.clientPath = getBundlePath(clientWpConfig);

  this.publicBundlePath = url.resolve(clientWpConfig.output.publicPath, clientWpConfig.output.filename);
  this.publicVendorPath = url.resolve(clientWpConfig.output.publicPath, this.config.vendorFilename);
}

Bundler.prototype.init = function(done) {
  if (this.config.compileJs === 'once') {
    return this._initWithOnceCompile(done);
  }

  else if (this.config.compileJs === 'watch') {
    return this._initWithWatchCompile(done);
  }

  else {
    return done(new Error('Unknown compileJs option value'));
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
      bundler.opts.processSoftError(err);
      return done(err);
    }

    if (context.status == null) {
      return done(new Error('Renderer did not return a status code'));
    }

    context.body = body;
    context.scripts = [
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

  return fs.readFile(bundler.serverPath, 'utf-8', function(err, bundle) {
    if (err) return done(err);

    try {
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
