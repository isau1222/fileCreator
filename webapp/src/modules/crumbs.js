var pathToRegexp = require('path-to-regexp');
var isString = require('lodash/isString');
var utils = require('@/utils');

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

          var href = utils.cleanUrl(route.path);
          var title = isString(crumb) ? crumb : crumb.title;
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
