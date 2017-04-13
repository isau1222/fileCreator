var store = require('@/store');
var utils = require('@/utils');

Vue.use(VueRouter);

var requirePage = require.context('@/pages', true, /\.vue$/);

// @NOTE: we don't want paths that start with $ to be routes
var pages = requirePage.keys()
  .filter(function(page) {
    return !page.includes('/$');
  });

var routes = createRoutes(pages, requirePage);

var router = new VueRouter({
  mode: 'history',
  base: process.env.APP_PUBLIC_PATH,
  routes: routes,
});

router.beforeEach(function(to, from, next) {
  var metas = to.matched.map(function(route) {
    return route.meta;
  });

  var meta = utils.merge(metas);

  // @TODO: document the `requiresAuthentication` field on routes
  if (!meta.requiresAuthentication) {
    return next();
  }
  // @TODO: maybe watch the store while `inProgress`, and then continue?
  var isAuthenticated = store.getters['auth/isAuthenticated'];
  if (isAuthenticated) {
    return next();
  }
  else {
    return next('/auth');
  }
});

// === //

module.exports = router;

// === //

// @REFERENCE: https://github.com/nuxt/nuxt.js/blob/v0.10.5/lib/build.js
// @NOTE: adapted to work with webpack contexts
function createRoutes(pages, req) {
  var routes = [];
  pages.forEach(function(page) {
    var keys = page.replace(/\.vue$/, '').replace(/\/{2,}/g, '/').split('/').slice(1);
    var component = req(page);
    var route = { name: '', path: '', components: { default: component } };
    var parent = routes;
    keys.forEach(function(key, i) {
      route.name = route.name ? route.name + '-' + key.replace('_', '') : key.replace('_', '');
      route.name += key === '_' ? 'all' : '';
      var child = _.find(parent, { name: route.name });
      if (child) {
        if (!child.children) {
          child.children = [];
        }
        parent = child.children;
        route.path = '';
      } else {
        if (key === 'index' && i + 1 === keys.length) {
          route.path += i > 0 ? '' : '/';
        } else {
          route.path += '/' + (key === '_' ? '*' : key.replace('_', ':'));
          if (key !== '_' && key.indexOf('_') !== -1) {
            route.path += '?';
          }
        }
      }
    });

    // Merge component-defined route config (if it is present) into the generated route config
    Object.assign(route, component.route);

    // Order Routes path
    parent.push(route);
    parent.sort(function(a, b) {
      if (!a.path.length || a.path === '/') {
        return -1;
      }
      if (!b.path.length || b.path === '/') {
        return 1;
      }
      var res = 0;
      var _a = a.path.split('/');
      var _b = b.path.split('/');
      for (var i = 0; i < _a.length; i++) {
        if (res !== 0) {
          break;
        }
        var y = _a[i].indexOf('*') > -1 ? 2 : _a[i].indexOf(':') > -1 ? 1 : 0;
        var z = _b[i].indexOf('*') > -1 ? 2 : _b[i].indexOf(':') > -1 ? 1 : 0;
        res = y - z;
        if (i === _b.length - 1 && res === 0) {
          res = 1;
        }
      }
      return res === 0 ? -1 : res;
    });
  });
  return cleanChildrenRoutes(routes);
}

// @REFERENCE: https://github.com/nuxt/nuxt.js/blob/v0.10.5/lib/build.js
function cleanChildrenRoutes(routes) {
  var isChild = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var start = -1;
  var routesIndex = [];
  routes.forEach(function(route) {
    if (/-index$/.test(route.name) || route.name === 'index') {
      // Save indexOf 'index' key in name
      var res = route.name.split('-');
      var s = res.indexOf('index');
      start = start === -1 || s < start ? s : start;
      routesIndex.push(res);
    }
  });
  routes.forEach(function(route) {
    route.path = isChild ? route.path.replace('/', '') : route.path;
    if (route.path.indexOf('?') > -1) {
      var names = route.name.split('-');
      var paths = route.path.split('/');
      if (!isChild) {
        paths.shift();
      } // clean first / for parents
      routesIndex.forEach(function(r) {
        var i = r.indexOf('index') - start; //  children names
        if (i < paths.length) {
          for (var a = 0; a <= i; a++) {
            if (a === i) {
              paths[a] = paths[a].replace('?', '');
            }
            if (a < i && names[a] !== r[a]) {
              break;
            }
          }
        }
      });
      route.path = (isChild ? '' : '/') + paths.join('/');
    }
    route.name = route.name.replace(/-index$/, '');
    if (route.children) {
      if (route.children.find(function(child) {
        return child.path === '';
      })) {
        delete route.name;
      }
      route.children = cleanChildrenRoutes(route.children, true);
    }
  });
  return routes;
}
