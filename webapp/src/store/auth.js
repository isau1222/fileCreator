var api = require('@/api');

module.exports = {
  namespaced: true,
  state: {
    inProgress: false,
    session: {
      isAuthenticated: false,
      user: null,
    },
    challenge: null,
  },
  getters: {
    'user': function(state) {
      return state.session.user;
    },
    'isAuthenticated': function(state) {
      return state.session.isAuthenticated;
    },
    'inProgress': function(state) {
      return state.inProgress;
    },
    'challenge': function(state) {
      return state.challenge;
    },
  },
  mutations: {
    'authentication-started': function(state) {
      state.inProgress = true;
    },
    'authentication-succeeded': function(state, payload) {
      state.inProgress = false;
      state.session = payload.session;
      state.challenge = null;
    },
    'authentication-failed': function(state, payload) {
      state.inProgress = false;
      state.session = payload.session;
      state.challenge = (payload.challenge || null);
    },
    'authentication-canceled': function(state, payload) {
      state.inProgress = false;
    },
  },
  actions: {
    'update': function(context) {
      context.commit('authentication-started');
      var response = api.post('/v1/auth/status');
      return finishAuthentication(context, response);
    },
    'login': function(context, credentials) {
      context.commit('authentication-started');
      var response = api.post('/v1/auth/login', credentials);
      return finishAuthentication(context, response);
    },
    'logout': function(context) {
      context.commit('authentication-started');
      var response = api.post('/v1/auth/logout');
      return finishAuthentication(context, response);
    },
  },
};

// This function takes a promise of api response that would contain the session
// and performs necessary steps to finish the (de)authentication
function finishAuthentication(context, response) {
  return response
    .then(function(response) {
      if (api.isSuccess(response)) {
        context.commit('authentication-succeeded', { session: response.data.result });
        return response;
      }
      else if (api.isFailure(response)) {
        context.commit('authentication-failed', { session: response.data.result, challenge: response.data.message });
        return response;
      }
      else {
        throw new Error('Unexpected response');
      }
    })
    .catch(function(err) {
      context.commit('authentication-canceled');
      throw err;
    });
}
