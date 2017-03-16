var path = require('path');

var SAILS_ROOT = path.resolve(__dirname, '..');

module.exports.public = {
  dir: path.resolve(SAILS_ROOT, 'public'),
};
