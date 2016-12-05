var api = require('../api');

module.exports = {
  state: {
    inProgress: false,
    session: {
      authenticated: false,
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
    'auth/deauthentication-started': function(state) {
      state.inProgress = true;
    },
    'auth/deauthentication-succeeded': function(state, payload) {
      state.inProgress = false;
      state.session = { authenticated: false };
      state.challenge = null;
    },
    'auth/deauthentication-failed': function(state, payload) {
      state.inProgress = false;
      state.challenge = (payload.challenge || null);
    },
  },
  actions: {
    'auth/remember': function(context) {
      context.commit('auth/authentication-started');
      return api.post('/v1/auth/status')
        .then(function(response) {
          if (api.isSuccess(response)) {
            context.commit('auth/authentication-succeeded', { session: response.data.result });
          }
          else if (api.isFailure(response)) {
            context.commit('auth/authentication-failed', { session: response.data.result, challenge: response.data.message });
          }
          else {
            throw new Error('Unexpected response');
          }
        })
        .catch(function(err) {
          if (api.isServerError(err)) {
            context.commit('auth/authentication-failed', { session: response.data.result, challenge: response.data.message });
          }
          else {
            context.commit('auth/authentication-failed', { session: response.data.result, challenge: err.message });
          }
          throw err;
        });
    },
    'auth/login': function(context, credentials) {
      context.commit('auth/authentication-started');
      return api.post('/v1/auth/login', credentials)
        .then(function(response) {
          if (api.isSuccess(response)) {
            context.commit('auth/authentication-succeeded', { session: response.data.result });
          }
          else if (api.isFailure(response)) {
            context.commit('auth/authentication-failed', { session: response.data.result, challenge: response.data.message });
          }
          else {
            throw new Error('Unexpected response');
          }
        })
        .catch(function(err) {
          if (api.isServerError(err)) {
            context.commit('auth/authentication-failed', { session: response.data.result, challenge: response.data.message });
          }
          else {
            context.commit('auth/authentication-failed', { session: response.data.result, challenge: err.message });
          }
          throw err;
        });
    },
    'auth/logout': function(context) {
      context.commit('auth/deauthentication-started');
      return api.post('/v1/auth/logout')
        .then(function(response) {
          if (api.isSuccess(response)) {
            context.commit('auth/deauthentication-succeeded');
          }
          else if (api.isFailure(response)) {
            context.commit('auth/deauthentication-failed', { challenge: response.data.message });
          }
          else {
            throw new Error('Unexpected response');
          }
        })
        .catch(function(err) {
          if (api.isServerError(err)) {
            context.commit('auth/deauthentication-failed', { challenge: response.data.message });
          }
          else {
            context.commit('auth/deauthentication-failed', { challenge: err.message });
          }
          throw err;
        });
    },
  },
};
