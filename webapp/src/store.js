var Vue = require('vue');
var Vuex = require('vuex');
Vue.use(Vuex);

module.exports = new Vuex.Store({
  state: {
    counter: 0,
  },
  mutations: {
    'counter/increment': function(state) {
      state.counter += 1;
    },
  },
});
