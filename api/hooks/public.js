var express = require('express');

module.exports = function(sails) {
  // @NOTE: mimicing express static middleware to be able to use it for
  //        non-proper request (sockets and `sails.request`)

  var middleware = express.static(sails.config.public.dir);

  return {
    routes: {
      before: {
        '/*': middleware,
      },
    },
  };
};
