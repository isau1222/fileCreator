var pathToRegexp = require('path-to-regexp');
var isFunction = require('lodash/isFunction');
var isPlainObject = require('lodash/isPlainObject');

module.exports = function install(Vue) {
  if (install.installed) {
    return;
  }

  install.installed = true;

  Object.defineProperty(Vue.prototype, '$crumbs', {
    get: function() {
      var currentRoute = this.$route;
      var curentHref = currentRoute.path;

      return currentRoute.matched
        .filter(function(route) {
          return route.meta.crumb != null;
        })
        .map(function(route) {
          var crumb = route.meta.crumb;

          // @NOTE: unify
          if (!isPlainObject(crumb)) {
            crumb = {
              title: crumb,
            };
          }

          // @TODO: figure out how to do this with just vue-router
          var href = pathToRegexp.compile(route.path)(currentRoute.params);

          var title = crumb.title;
          if (isFunction(title)) {
            title = title(currentRoute);
          }

          // @TODO: figure out how to do this with just vue-router
          var active = pathToRegexp(href).test(curentHref);

          return {
            href: href,
            active: active,
            title: title,
          };
        });
    },
  });
};
