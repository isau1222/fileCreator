var cuid = require('cuid');

var Vue = require('vue');
var Vuex = require('vuex');
Vue.use(Vuex);

var api = require('../api');

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
          context.commit('meta/changed', response.data.result);
        });
    },
  },
});

// @NOTE: set up an response interceptor to automatically record errors

api.axios.interceptors.response.use(apiSuccessHandler, apiFailureHandler);

function apiSuccessHandler(response) {
  return response;
}

function apiFailureHandler(err) {
  store.commit('log/error', {
    id: cuid(),
    message: err.message,
    stack: err.stack,
  });

  console.error('@apiFailureHandler', err); // FIXME: proper logging

  return Promise.reject(err);
}

// === //

module.exports = store;
