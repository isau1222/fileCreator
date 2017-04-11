var path = require('path');
var glob = require('glob');
var bower = require('bower-files')();

var SAILS_ROOT = path.resolve(__dirname, '..');
var ASSETS_ROOT = path.resolve(SAILS_ROOT, 'assets');

var bowerFiles = bower
  .ext(['js', 'css'])
  .files;

console.log('Including files from bower:');
bowerFiles.forEach(function(file) {
  console.log(' - ' + file);
});

module.exports.assets = {

  // Whether the server should compile the bundle
  // - `skip` will skip the compilation and use existing bundle
  // - `once` will compile bundles once
  // @TODO: `reuse` strategy, compile if not present
  compile: 'once',

  // Webpack config for assets bundle
  wpConfig: {
    devtool: '#cheap-module-inline-source-map',
    context: ASSETS_ROOT,
    entry: Array.prototype.concat.apply([], [

      // Bower files
      bowerFiles,

      // Vendor files
      match('./vendor/**/*.js'),
      match('./vendor/**/*.css'),

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

  if (paths.length === 0) {
    console.warn('Asset pattern ' + pattern + ' did not match any files');
  }

  // @NOTE: we have to explicitly make them relative to conform with commonJs
  //        require syntax, otherwise webpack will try to look for them
  //        in the node_modules
  return paths.map(function(filepath) {
    return './' + filepath;
  });
}
