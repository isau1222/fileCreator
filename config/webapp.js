var path = require('path');

var pkg = require('read-pkg-up').sync().pkg;
var SAILS_ROOT = path.resolve(__dirname, '..');
var WEBAPP_ROOT = path.resolve(SAILS_ROOT, 'webapp', 'src');

module.exports.webapp = {

  // The id of the element the app will be mounted to
  appId: 'webapp',

  // Whether the app will be prerendered on the server
  ssrEnabled: true,

  // Public path to the base of the app
  publicPath: '/',

  // Public path to the api of the app
  apiPublicPath: '/api',

  // Whether the server should compile bundles
  // - `once` will compile bundles once
  // - `watch` will recompile bundles on changes
  // @TODO: `reuse` strategy, compile if not present
  compile: 'watch',

  // Node environment (often used for dev/prod conditional compiling)
  NODE_ENV: 'development',

  // Whether the server should minify compiled files
  // - `true` will minify
  // - `false` will keep as is
  uglify: false,

  // The name of the vendor client bundle
  vendorFilename: 'vendor-client.js',

  // Which build of vue should be used
  vueAlias: 'vue/dist/vue.common.js',

  // Name for the server bundle
  serverBundleName: 'bundle-server.json',

  // Webpack config for the server bundle
  server: {
    context: WEBAPP_ROOT,
    devtool: '#cheap-module-source-map',
    entry: './main-server.js',
    output: {
      // @NOTE: filename is not needed because we will output with vue-ssr-webpack-plugin instead of the regular way
      path: path.resolve(SAILS_ROOT, '.tmp'),
    },
    externals: Object.keys(pkg.dependencies),
  },

  // Webpack config for the client bundle
  client: {
    context: WEBAPP_ROOT,
    devtool: '#cheap-module-inline-source-map',
    entry: {
      app: './main-client.js',
      vendor: ['vue', 'vue-router', 'vuex', 'axios'],
    },
    output: {
      filename: 'bundle-client.js',
      path: path.resolve(SAILS_ROOT, '.tmp/public/assets'),
      publicPath: '/assets/', // @NOTE: has to end with a slash
    },
  },

};
