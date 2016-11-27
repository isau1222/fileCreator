var Vue = require('vue');
var VueRouter = require('vue-router');
Vue.use(VueRouter);

var Dashboard = {
  name: 'Dashboard',
  template: [
    '<div>I am dashboard</div>',
  ].join(''),
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
module.exports = new VueRouter({
  mode: 'history',
  base: process.env.APP_PUBLIC_PATH, // @FIXME: router appears to ignore this during SSR
  routes: [
    { path: '/', component: Dashboard },
    {
      path: '/reports',
      component: Reports,
      children: [
        { path: '', component: ReportList },
        { path: ':reportId', component: Report },
      ],
    },
  ],
});
