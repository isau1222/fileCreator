var Vue = require('vue');

var main = require('./main');
var app = main.app;
var router = main.router;
var store = main.store;

// @NOTE: exposes a factory
module.exports = function(context) {
  var vm = new Vue(app);

  var base = process.env.APP_ROUTER_BASE;
  var url = context.url.slice(base.length);
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
