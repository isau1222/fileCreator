var main = require('./main');
var vm = main.vm;
var router = main.router;
var store = main.store;

// @NOTE: state rehydration
store.replaceState(window.__INITIAL_STATE__);

// @NOTE: mounts to the DOM
vm.$mount('[server-rendered="true"]');
