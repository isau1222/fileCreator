var cuid = require('cuid');
var Vue = require('vue');

module.exports = {
  state: [],
  mutations: {
    'toast/added': function(state, toast) {
      state.push(toast);
    },
    'toast/removed': function(state, toastId) {
      var io = state.findIndex(function(toast) {
        return (toast.id === toastId);
      });
      state.splice(io, 1);
    },
  },
  actions: {
    'toast/add': function(context, toast) {
      var id = cuid();
      Vue.set(toast, 'id', id);
      context.commit('toast/added', toast);
      return id;
    },
    'toast/remove': function(context, toastId) {
      context.commit('toast/removed', toastId);
    }
  },
};
