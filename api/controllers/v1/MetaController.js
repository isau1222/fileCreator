/**
 * MetaController
 *
 * @description :: Information about the service
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var pkg = require('read-pkg-up').sync().pkg;

module.exports = {

  index: function(req, res) {
    return res.apiOk({
      version: pkg.version,
    });
  },

};
