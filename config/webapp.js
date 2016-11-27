var path = require('path');

var pkg = require('read-pkg-up').sync().pkg;
var SAILS_ROOT = path.resolve(__dirname, '..');
var WEBAPP_ROOT = path.resolve(SAILS_ROOT, 'webapp', 'src');

module.exports.webapp = {

  // Public path to the base of the app
  publicPath: '/webapp',

  // Public path to the api of the app
  apiPublicPath: '/api',

  // Whether the server should compile bundles
  // - `once` will compile bundles once
  // - `watch` will recompile bundles on changes
  compileJs: 'watch',

  // Node environment (often used for dev/prod conditional compiling)
  NODE_ENV: 'development',

  // Whether the server should minify compiled files
  // - `true` will minify
  // - `false` will keep as is
  uglifyJs: false,

  // The name of the vendor client bundle
  vendorFilename: 'vendor-client.js',

  // Which build of vue should be used
  vueAlias: 'vue/dist/vue.common.js',

  // Webpack config for the server bundle
  server: {
    context: WEBAPP_ROOT,
    devtool: null,
    entry: './main-server.js',
    output: {
      filename: 'bundle-server.js',
      path: path.resolve(SAILS_ROOT, '.tmp'),
      externals: Object.keys(pkg.dependencies),
    },
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
