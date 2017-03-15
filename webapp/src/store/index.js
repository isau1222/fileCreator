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
          context.commit('meta/changed', response.data.result);
        })
        .catch(console.warn);
    },
  },
});

// @NOTE: set up an response interceptor to automatically record errors

api.axios.interceptors.response.use(apiSuccessHandler, apiFailureHandler);

// @NOTE: make sure this does not throw errors, because this would reject
//        the promise and collapse the chain
function apiSuccessHandler(response) {
  // @TODO: these might be annoying, maybe show them conditionally,
  //        depending on a config option

  store.dispatch('toast/add', {
    type: 'info',
    message: 'Request succeded: ' + (response.data && response.data.message || '<No message>'),
  });

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

  // @FIXME: extract error info with proper api methods

  var error = {
    message: api.extractErrorMessage(err),
    stack: api.extractErrorStack(err),
  };

  if (api.isFailure(err)) {
    toast = {
      type: 'error',
      message: 'Request failed: ' + error.message,
      error: error,
    };
  }
  else if (api.isServerError(err)) {
    toast = {
      type: 'error',
      title: 'Server error: ' + error.message,
      error: error,
    };
  }
  else if (api.isConnectivityError(err)) {
    toast = {
      type: 'error',
      title: 'Connectiviry error: ' + error.message,
      error: error,
    };
  }
  else {
    toast = {
      type: 'error',
      title: 'Unexpected error: ' + error.message,
      error: error,
    };
  }

  store.dispatch('toast/add', toast);

  throw err;
}

// === //

module.exports = store;
