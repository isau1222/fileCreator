var Vue = require('vue');
var VueRouter = require('vue-router');
Vue.use(VueRouter);

var Dashboard = {
  name: 'Dashboard',
  template: [
    '<div>',
    '  <h1>Dashboard</h1>',
    '  <p>Counter: {{ $store.state.counter }}</p>',
    '  <p><button @click="$store.commit(\'counter/increment\')">Increment</button></p>',
    '</div>',
  ].join(''),
};

var Reports = {
  name: 'Reports',
  template: [
    '<div>',
    '  <h1>Reports</h1>',
    '  <p>Counter: {{ $store.state.counter }}</p>',
    '  <p><button @click="$store.commit(\'counter/increment\')">Increment</button></p>',
    '</div>',
  ].join(''),
};

module.exports = new VueRouter({
  mode: 'history',
  base: process.env.APP_ROUTER_BASE,
  routes: [
    { path: '/', component: Dashboard },
    { path: '/reports', component: Reports },
  ],
});
