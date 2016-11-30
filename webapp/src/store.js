var cuid = require('cuid');

var Vue = require('vue');
var Vuex = require('vuex');
Vue.use(Vuex);

var api = require('./api');

var store = new Vuex.Store({
  state: {
    errors: [],
    meta: null,
  },
  mutations: {
    'log/error': function(state, error) {
      state.errors.push(error);
    },
    'meta/changed': function(state, meta) {
      state.meta = meta;
    },
  },
  actions: {
    'meta/update': function(context) {
      return api.get('/v1/meta')
        .then(function(response) {
          context.commit('meta/changed', response.data.data);
        })
        .catch(apiErrorHandler);
    },
  },
});

function apiErrorHandler(err) {
  store.commit('log/error', {
    id: cuid(),
    message: err.message,
    stack: err.stack,
  });

  console.log('@apiErrorHandler', err); // FIXME: proper logging

  throw err;
}

// === //

module.exports = store;
