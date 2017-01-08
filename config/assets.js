var path = require('path');
var glob = require('glob');
var bower = require('bower-files')();

var SAILS_ROOT = path.resolve(__dirname, '..');
var ASSETS_ROOT = path.resolve(SAILS_ROOT, 'assets');

module.exports.assets = {

  // @TODO: compile stategies `once` and `reuse`

  // Webpack config for assets bundle
  wpConfig: {
    devtool: '#cheap-module-inline-source-map',
    context: ASSETS_ROOT,
    entry: Array.prototype.concat.apply([], [
      bower.ext(['js', 'css']).files,
      match('./template/**/*.js'),
      match('./template/**/*.css'),
    ]),
    output: {
      path: path.resolve(SAILS_ROOT, '.tmp/public/assets'),
      filename: 'assets-client.js',
      publicPath: '/assets/', // @NOTE: has to end with a slash
    },
  },

  // Whether the server should minify compiled files
  // - `true` will minify
  // - `false` will keep as is
  uglify: false,

  // The name of the client assets css bundle
  cssFilename: 'assets-client.css',

};

// Utility function, matches glob pattern against the asset directory.
// Return a list of relative file paths to be consumed by webpack.
function match(pattern) {
  var paths = glob.sync(pattern, { cwd: ASSETS_ROOT });

  // @NOTE: we have to explicitly make them relative to conform with commonJs
  //        require syntax, otherwise webpack will try to look for them
  //        in the node_modules
  return paths.map(function(filepath) {
    return './' + filepath;
  });
}
