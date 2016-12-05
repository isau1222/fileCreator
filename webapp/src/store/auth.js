var api = require('../api');

module.exports = {
  state: {
    inProgress: false,
    session: {
      authenticated: false,
      user: null,
    },
    challenge: null,
  },
  mutations: {
    'auth/authentication-started': function(state) {
      state.inProgress = true;
    },
    'auth/authentication-succeeded': function(state, payload) {
      state.inProgress = false;
      state.session = payload.session;
      state.challenge = null;
    },
    'auth/authentication-failed': function(state, payload) {
      state.inProgress = false;
      state.session = payload.session;
      state.challenge = (payload.challenge || null);
    },
    'auth/authentication-canceled': function(state, payload) {
      state.inProgress = false;
    },
  },
  actions: {
    'auth/update': function(context) {
      context.commit('auth/authentication-started');
      var response = api.post('/v1/auth/status');
      return finishAuthentication(context, response);
    },
    'auth/login': function(context, credentials) {
      context.commit('auth/authentication-started');
      var response = api.post('/v1/auth/login', credentials);
      return finishAuthentication(context, response);
    },
    'auth/logout': function(context) {
      context.commit('auth/authentication-started');
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
        context.commit('auth/authentication-succeeded', { session: response.data.result });
        return response;
      }
      else if (api.isFailure(response)) {
        context.commit('auth/authentication-failed', { session: response.data.result, challenge: response.data.message });
        return response;
      }
      else {
        throw new Error('Unexpected response');
      }
    })
    .catch(function(err) {
      context.commit('auth/authentication-canceled');
      throw err;
    });
}
