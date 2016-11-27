var Vue = require('vue');

var main = require('./main');
var app = main.app;
var router = main.router;
var store = main.store;

function cleanUrl(value) {
  if (value[0] !== '/' && value[0] !== '.') {
    value = '/' + value;
  }

  if (value[value.length - 1] === '/') {
    value = value.slice(0, -1);
  }

  return value;
}

// @NOTE: exposes a factory
module.exports = function(context) {
  var vm = new Vue(app);

  // @NOTE: app can be in a subfolder, so we need to extract
  //        the base path before we pass the route down to the router
  // @FIXME: make sure it works under any circumstances
  var publicPath = cleanUrl(process.env.APP_PUBLIC_PATH);
  var furl = cleanUrl(context.url); // @NOTE: full url
  var url = furl.slice(publicPath.length);
  router.push(url);

  // @FIXME: implement
  context.status = 200;

  // @FIXME: implement
  context.helmet = {
    lang: 'en',
    title: 'Hello from Vue!',
    canonical: context.url,
    meta: [
      { name: 'description', content: 'Description' },
    ],
  };

  context.initialState = store.state;

  return Promise.resolve(vm);
};
