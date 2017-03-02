var main = require('@/main');
var app = main.app;
var api = main.api;
var router = main.router;
var store = main.store;

// @NOTE: state rehydration
// @TODO: codepath when no rehydration occures (mimic the SSR codepath)
store.replaceState(window.__INITIAL_STATE__);

// @NOTE: create the instance
var vm = new Vue(app);

// @NOTE: wait until router has resolved possible async hooks
router.onReady(function() {
  // @NOTE: mount the instance to the dom
  vm.$mount('#' + process.env.APP_ID);
});
