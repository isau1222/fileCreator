var vueModules = require.context('@/vue-modules', true, /\.js$/);
_.each(vueModules.keys(), path => vueModules(path));

var defaultLayout = require('@/layouts/default');

module.exports = {

  api: require('@/api'),
  store: require('@/store'),
  router: require('@/router'),
  routeData: require('@/route-data'),

  // @NOTE: this will be called during SSR
  // @NOTE: this is a static method of the component, and can not access `this`,
  //        because the instance may not exist during SSR
  // @NOTE: the only way to share information between server and client
  //        is to pass it through the vuex store, so it's likely that
  //        only store actions will be called here
  // @NOTE: restrain from cross-origin requests, because it's awkward
  //        to perform them during ssr
  // @NOTE: this preFetch should fetch all the data necessary for resolving
  //        router guards
  // @NOTE: in most components preFetch has a signature of `(store, route)`,
  //        but for the root component preFetch happens before the router is
  //        ignited, so it only gets `(store)`
  preFetch: function(store) {
    return Promise.resolve()
      .then(function() {
        return store.dispatch('auth/update');
      });
  },

  render: function(h) {
    // @TODO: when vue-router supports getting proper matched records,
    //        move the `layout` field to the route record instead of route record meta

    var found = _.findLast(this.$route.matched, function(route) {
      return route.meta.layout;
    });

    var layout = found ? found.meta.layout : defaultLayout;

    return h(layout);
  },

};
