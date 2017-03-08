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

  echo: function(req, res) {
    // @REFERENCE: http://sailsjs.com/documentation/reference/request-req
    return res.apiOk({
      query: req.query,
      body: req.body,
      // @NOTE: this query does not have url path params
    });
  },

};
