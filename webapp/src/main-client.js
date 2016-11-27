var Vue = require('vue');

var main = require('./main');
var app = main.app;
var api = main.api;
var router = main.router;
var store = main.store;

// @NOTE: state rehydration
store.replaceState(window.__INITIAL_STATE__);

// @NOTE: mounts to the DOM
var vm = new Vue(app);
vm.$mount('[server-rendered="true"]');
