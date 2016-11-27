var store = require('./store');
var router = require('./router');

var app = {

  store: store,
  router: router,

  template: [
    '<div>',
      '<ul>',
        '<li><router-link to="/">Dashboard</router-link></li>',
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

};

module.exports = {
  app: app,
  router: router,
  store: store,
};
