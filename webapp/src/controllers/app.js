module.exports = {

  name: 'App',

  template: [
    '<div>',
      '<ul>',
        '<li><router-link to="/">Dashboard</router-link></li>',
        '<li><router-link to="/auth">Auth</router-link></li>',
        '<li>',
          '<router-link to="/reports">Reports</router-link>',
          '<ul>',
            '<li><router-link to="/reports/1">Report #1</router-link></li>',
          '</ul>',
        '</li>',
      '</ul>',
      '<router-view></router-view>',
    '</div>',
  ].join(''),

  // @NOTE: this will be called during SSR
  // @NOTE: this is a static method of the component, and can not access `this`,
  //        because the instance may not exist during SSR
  // @NOTE: the only way to share information between server and client
  //        is to pass it through the vuex store, so it's likely that
  //        only store actions will be called here
  // @NOTE: restrain from cross-origin requests, because it's awkward
  //        to perform them during ssr
  preFetch: function(store, route) {
    return Promise.resolve()
      .then(function() {
        return store.dispatch('auth/update');
      })
      .then(function() {
        return Promise.all([
          store.dispatch('meta/update'),
        ]);
      });
  },

};