Vue.use(Vuex);

var cuid = require('cuid');
var serializeError = require('serialize-error');

var api = require('@/api');

var store = new Vuex.Store({
  modules: {
    toast: require('./toast'),
    auth: require('./auth'),
  },
  state: {
    meta: null,
  },
  mutations: {
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
  var toast;

  if (api.isSuccess(response)) {
    // @TODO: these might be annoying, maybe show them conditionally,
    //        depending on a config option
    toast = {
      type: 'info',
      message: response.data.message,
    };
  }
  else {
    toast = {
      type: 'warning',
      message: response.data.message,
      error: response.data.$error,
    };
  }

  if (toast) {
    store.dispatch('toast/add', toast);
  }

  return response;
}

// @NOTE: make sure this does not throw errors except for the one it was given,
//        because it would break the api failure handlers in call sites
function apiFailureHandler(err) {
  var toast;

  // @NOTE: in dev mode server sends error info for debugging
  // @NOTE: we don't want to hide it under a env guard because
  //        we might want to see the error on production server
  //        without rebundling

  if (api.isServerError(err)) {
    toast = {
      type: 'error',
      title: 'Error: ' + (err.response.data.message || '<No message>'),
      error: err.response.data.$error,
    };
  }
  else {
    toast = {
      type: 'error',
      title: 'Error: ' + err.message,
      error: serializeError(err),
    }
  }

  if (toast) {
    store.dispatch('toast/add', toast);
  }

  return Promise.reject(err);
}

// === //

module.exports = store;
