var store = require('@/store');
var utils = require('@/utils');

Vue.use(VueRouter);

// @NOTE: utility component that is just a container
var Container = {
  name: 'Container',
  render: function(h) {
    return h('router-view')
  },
};

var Reports = {
  name: 'Reports',
  template: [
    '<router-view></router-view>',
  ].join(''),
};

var ReportList = {
  name: 'ReportList',
  template: [
    '<div>I am report list</div>',
  ].join(''),
};

var Report = {
  name: 'Report',
  template: [
    '<div>I am report #{{ $route.params.reportId }}</div>',
  ].join(''),
};

// @NOTE: nested paths that start with `/` will be treated as a root path
var router = new VueRouter({
  mode: 'history',
  base: process.env.APP_PUBLIC_PATH,
  routes: [
    {
      path: '/',
      component: require('@/controllers/dashboard.vue'),
      meta: {
        crumb: 'Dashboard',
      },
    },
    {
      path: '/auth',
      component: require('@/controllers/auth.vue'),
      meta: {
        crumb: 'Auth',
      },
    },
    {
      path: '/reports',
      component: Reports,
      meta: {
        crumb: 'Reports',
      },
      children: [
        {
          path: '',
          component: ReportList,
        },
        {
          path: ':reportId',
          name: 'report',
          component: Report,
          meta: {
            crumb: 'Report',
          },
        },
      ],
    },
    {
      path: '*',
      component: require('@/controllers/error-404.vue'),
      meta: {
        crumb: 'Error',
        status: 404,
      },
    },
  ],
});

router.beforeEach(function(to, from, next) {
  var metas = to.matched.map(function(route) {
    return route.meta;
  });

  var meta = utils.merge(metas);

  // @TODO: document the `requiresAuthentication` field on routes
  if (!meta.requiresAuthentication) {
    return next();
  }

  // @TODO: maybe watch the store while `inProgress`, and then continue?
  var isAuthenticated = store.getters['auth/isAuthenticated'];
  if (isAuthenticated) {
    return next();
  }
  else {
    return next('/auth');
  }
});

// === //

module.exports = router;
