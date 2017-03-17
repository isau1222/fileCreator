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

  cleanUrl: function(value) {
    if (value[0] !== '/' && value[0] !== '.') {
      value = '/' + value;
    }

    if (value !== '/' && value[value.length - 1] === '/') {
      value = value.slice(0, -1);
    }

    return value;
  },

};
