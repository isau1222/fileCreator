var api = require('./api');
var store = require('./store');
var router = require('./router');
var app = require('./controllers/app.vue');

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
};
