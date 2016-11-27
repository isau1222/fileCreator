var Vue = require('vue');

// @NOTE: axios does not expose settle on the main module, but we need it
//        for the custom adapter, so let's import it directly.
// @NOTE: this is quite fragile
var settle = require('axios/lib/core/settle');

var main = require('./main');
var app = main.app;
var api = main.api;
var router = main.router;
var store = main.store;

function cleanUrl(value) {
  if (value[0] !== '/' && value[0] !== '.') {
    value = '/' + value;
  }

  if (value[value.length - 1] === '/') {
    value = value.slice(0, -1);
  }

  return value;
}

function makeSailsAdapter(context) {
  return function sailsAdapter(config) {
    // @TODO: reject request to a remote server?
    return new Promise(function(resolve, reject) {
      console.log('@sails', context.sails);
      var request = {
        url: config.url, // @FIXME: produces question mark an the end of the url?
        method: config.method,
        headers: config.headers, // @FIXME: enhance headers with cookies?
        data: config.data,
      };

      context.sails.request(request, function(err, response) {
        if (err) {
          return settle(resolve, reject, {
            data: err.body,
            status: err.status,
            // @FIXME: no headers?
            config: config,
          });
        }
        else {
          return settle(resolve, reject, {
            data: response.body,
            status: response.status,
            // headers: response.headers,
            config: config,
          });
        }
      });
    });
  };
}

// @NOTE: exposes a factory
module.exports = function(context) {
  var vm = new Vue(app);

  // @NOTE: to be able to prefetch data during ssr, we set axios adapter
  //        that will call our sails api directly
  api.axios.defaults.adapter = makeSailsAdapter(context);

  // @NOTE: app can be in a subfolder, so we need to extract
  //        the base path before we pass the route down to the router
  // @FIXME: make sure it works under any circumstances
  var publicPath = cleanUrl(process.env.APP_PUBLIC_PATH);
  var furl = cleanUrl(context.url); // @NOTE: full url
  var url = furl.slice(publicPath.length);
  router.push(url);

  // @NOTE: prefetch data for the components
  var route = router.currentRoute;
  var components = router.getMatchedComponents();
  components.unshift(app); // @NOTE: router does not include the root component

  var fetches = components.map(function(component) {
    if (component.preFetch) {
      return component.preFetch(store, route);
    }
  });

  return Promise.all(fetches)
    .then(function() {
      // @NOTE: after routing and prefetching is done, we report the results
      //        back to the bundler

      // @FIXME: implement
      context.status = 200;

      // @FIXME: implement
      context.helmet = {
        lang: 'en',
        title: 'Hello from Vue!',
        canonical: context.url,
        meta: [
          { name: 'description', content: 'Description' },
        ],
      };

      context.initialState = store.state;

      return vm;
    });
};
