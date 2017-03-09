var main = require('@/main');
var app = main.app;
var api = main.api;
var router = main.router;
var store = main.store;
var routeData = main.routeData;

// === //

var rehydration = (window.__INITIAL_STATE__ != null) && (window.__ROUTE_DATA_CACHE__ != null);

var targetSelector = '#' + process.env.APP_ID;
var target = document.querySelector(targetSelector);
if (!target) {
  throw new Error('The root element ' + targetSelector + ' is not present');
}

// == //

// @NOTE: hacky solution for hacky task :D
if (rehydration) {
  routeData.rehydration = true;
}

// @NOTE: create the instance
var vm = new Vue(app);

Promise.resolve()
  .then(function() {
    if (rehydration) {
      store.replaceState(window.__INITIAL_STATE__);
      routeData.cache = window.__ROUTE_DATA_CACHE__;
    }
    else {
      // @NOTE: prefetch the root data, which is necessary for router guards
      if (app.preFetch) {
        return app.preFetch(store);
      }
      else {
        // @TODO: warn that no root data is fetched
      }
    }
  })
  .then(function() {
    // @NOTE: wait for the router to settle
    return new Promise(function(resolve, reject) {
      return router.onReady(resolve);
    });
  })
  .then(function() {
    if (rehydration) {
      routeData.rehydration = false;
      // @NOTE: do nothing specific, all data was already prefetched
    }
    else {
      // @NOTE: prefetch the rest of the data for components
      var components = router.getMatchedComponents();

      var fetches = components.map(function(component) {
        if (component.preFetch) {
          return component.preFetch(store, router.currentRoute);
        }
      });

      return Promise.all(fetches);
    }
  })
  .then(function() {
    vm.$mount(target);
  });
