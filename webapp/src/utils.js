var Vuex = require('vuex');

module.exports = {

  // @DOCS: utility function that merges objects from a list with `Object.assign`
  merge: function(target, items) {
    if (items === undefined) {
      items = target;
      target = {};
    }

    if (items === undefined) {
      return {};
    }

    items = Array.from(items);
    items.unshift(target);

    return Object.assign.apply(Object, items);
  },

};
