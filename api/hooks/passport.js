// @REFERENCE: https://github.com/sails101/using-passport/blob/93eb281764c3aa115d8ac017ca5d7d3615f31a72/api/hooks/passport/index.js

var passport = require('passport');
var IncomingMessageExt = require('passport/lib/http/request'); // @NOTE: fragile

module.exports = function(sails) {
  var initialize = passport.initialize();
  var session = passport.session();

  // @NOTE: mimicing express passport middleware to be able to use it for
  //        non-proper request (sockets and `sails.request`)
  function middleware(req, res, next) {
    extendReqRes(req, res);
    initialize(req, res, function(err) {
      if (err) return next(err);
      session(req, res, function (err) {
        if (err) return next(err);
        return next();
      });
    });
  }

  return {
    routes: {
      before: {
        '/*': middleware,
      },
    },
  };
};

function noop() {
  // @NOTE: do nothing
}

function extendReqRes(req, res) {
  var methods = ['login', 'logIn', 'logout', 'logOut', 'isAuthenticated', 'isUnauthenticated'];
  for (var i = 0, l = methods.length; i < l; i++) {
    var method = methods[i];
    if (!req[method]) {
      req[method] = IncomingMessageExt[method];
    }
  }

  // @NOTE: some agents (e.g. remember-me) rely on `req.res` being defined
  req.res = res;

  // @NOTE: some agents (e.g. remember-me) rely on `res.clearCookie` being defined
  if (!res.clearCookie) {
    res.clearCookie = noop;
  }
}
