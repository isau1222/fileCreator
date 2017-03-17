var cuid = require('cuid');

module.exports = {
  namespaced: true,
  state: [],
  mutations: {
    'added': function(state, toast) {
      state.push(toast);
    },
    'removed': function(state, toastId) {
      var io = state.findIndex(function(toast) {
        return (toast.id === toastId);
      });
      state.splice(io, 1);
    },
  },
  actions: {
    'add': function(context, toast) {
      var id = cuid();
      Vue.set(toast, 'id', id);
      context.commit('added', toast);
      return id;
    },
    'remove': function(context, toastId) {
      context.commit('removed', toastId);
    },
  },
};
