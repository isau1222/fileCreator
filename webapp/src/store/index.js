var cuid = require('cuid');
var serializeError = require('serialize-error');

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
          if (api.isSuccess(response)) {
            context.commit('meta/changed', response.data.result);
          }
        });
    },
  },
});

// @NOTE: set up an response interceptor to automatically record errors

api.axios.interceptors.response.use(apiSuccessHandler, apiFailureHandler);

// @NOTE: make sure this does not throw errors, because this would reject
//        the promise and collapse the chain
function apiSuccessHandler(response) {
  if (api.isFailure(response)) {
    var record = {
      id: cuid(),
      message: response.data.message,
      error: response.data.$error,
    };

    store.commit('log/error', record);
  }

  return response;
}

// @NOTE: make sure this does not throw errors except for the one it was given,
//        because it would break the api failure handlers in call sites
function apiFailureHandler(err) {
  var record = {
    id: cuid(),
  };

  if (api.isServerError(err)) {
    record.message = err.response.data.message || '<No message>';

    // @NOTE: in dev mode server sends error info for debugging
    // @NOTE: we don't want to hide this under a env guard because
    //        we might want to see the error on production server
    //        without rebundling
    record.error = err.response.data.$error;
  }
  else {
    record.message = err.message;
    record.error = serializeError(err);
  }

  store.commit('log/error', record);

  return Promise.reject(err);
}

// === //

module.exports = store;
