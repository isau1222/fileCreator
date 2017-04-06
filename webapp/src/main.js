var vueModules = require.context('@/vue-modules', true, /\.js$/);
_.each(vueModules.keys(), path => vueModules(path));

var rootVue = require('@/pages/app.vue');
module.exports = _.extend({}, rootVue, {
  api: require('@/api'),
  store: require('@/store'),
  router: require('@/router'),
  routeData: require('@/route-data'),
});
