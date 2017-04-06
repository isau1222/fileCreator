var modules = [
  require('@/modules/crumbs'),
  require('@/modules/register-all'),
];

modules.forEach(function(module) {
  Vue.use(module);
});

var rootVue = require('@/pages/app.vue');
module.exports = _.extend({}, rootVue, {
  api: require('@/api'),
  store: require('@/store'),
  router: require('@/router'),
  routeData: require('@/route-data'),
});
