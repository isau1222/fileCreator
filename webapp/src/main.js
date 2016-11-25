var Vue = require('vue');

var store = require('./store');
var router = require('./router');

var vm = new Vue({
  store: store,
  router: router,
  template: [
    '<div>',
    '  <ul>',
    '    <li><router-link to="/">Dashboard</router-link></li>',
    '    <li><router-link to="/reports">Reports</router-link></li>',
    '  </ul>',
    '  <router-view></router-view>',
    '</div>',
  ].join(''),
});

module.exports = {
  vm: vm,
  store: store,
  router: router,
};
