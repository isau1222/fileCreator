var modules = [
  require('@/modules/crumbs'),
  require('@/modules/register-all'),
];

modules.forEach(function(module) {
 Vue.use(module);
});

var api = require('@/api');
var store = require('@/store');
var router = require('@/router');
var routeData = require('@/route-data');
var app = require('@/pages/app.vue');

app = Object.assign({}, app, {
  api: api,
  store: store,
  router: router,
});

// === //

module.exports = {
  app: app,
  api: api,
  router: router,
  store: store,
  routeData: routeData,
};
