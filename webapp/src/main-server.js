// @NOTE: axios does not expose settle on the main module, but we need it
//        for the custom adapter, so let's import it directly.
// @NOTE: this is quite fragile
var settle = require('axios/lib/core/settle');

var main = require('@/main');
var api = require('@/api');
var router = require('@/router');
var store = require('@/store');
var routeData = require('@/route-data');

// @TODO: replace with `utils.cleanUrl`
function cleanUrl(value) {
  if (value[0] !== '/' && value[0] !== '.') {
    value = '/' + value;
  }

  // @FIXME: there is a known issue that this trims '/' to '',
  //         and fixing it will break other parts of the app that join urls
  if (value[value.length - 1] === '/') {
    value = value.slice(0, -1);
  }

  return value;
}

function makeSailsAdapter(context) {
  return function sailsAdapter(config) {
    // @TODO: reject request to a remote server?
    return new Promise(function(resolve, reject) {
      // @NOTE: remember-me mechanism triggers redirect when engaged,
      //        so we can be sure that the cookies from the primary request
      //        are the ones sails expects for future (virtual) requests

      var request = {
        url: config.url, // @FIXME: produces question mark an the end of the url?
        method: config.method,
        headers: Object.assign({}, config.headers, {
          'cookie': context.req.headers['cookie'],
          'accept-language': context.req.headers['accept-language'],
          'user-agent': context.req.headers['user-agent'],
        }),
      };

      if (config.data != null) {
        // @NOTE: axios adapter recieves serialized data, but sails expects non-serialized data,
        //        so we have to deserialize it
        try {
          request.data = JSON.parse(config.data);
        }
        catch (err) {
          // @TODO: log application failure
        }
      }

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
            status: response.statusCode,
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
  // @NOTE: to be able to prefetch data during ssr, we set axios adapter
  //        that will call our sails api directly
  api.axios.defaults.adapter = makeSailsAdapter(context);

  // @NOTE: app can be in a subfolder, so we need to extract
  //        the base path before we pass the route down to the router
  // @FIXME: make sure it works under any circumstances
  var publicPath = cleanUrl(process.env.APP_PUBLIC_PATH);
  var furl = cleanUrl(context.req.url); // @NOTE: full url
  var url = furl.slice(publicPath.length);

  // @NOTE: the instance will be stored in this variable
  var vm;

  return Promise.resolve()
    .then(function() {
      // @NOTE: prefetch the root data, which is necessary for router guards
      if (main.preFetch) {
        return main.preFetch(store);
      }
      else {
        // @TODO: warn that no root data is fetched
      }
    })
    .then(function() {
      // @NOTE: create the instance
      vm = new Vue(main);

      // @NOTE: push the url and wait for the router to settle
      router.push(url);
      return new Promise(function(resolve, reject) {
        return router.onReady(resolve);
      });
    })
    .then(function() {
      // @NOTE: prefetch the rest of the data for components
      var components = router.getMatchedComponents();

      var fetches = components.map(function(component) {
        if (component.preFetch) {
          return component.preFetch(store, router.currentRoute);
        }
      });

      return Promise.all(fetches);
    })
    .then(function() {
      // @NOTE: retrieve current route
      var route = router.currentRoute;
      var canonical = cleanUrl(publicPath + route.fullPath); // @TODO: better mechanism to extract canonical?

      // @TODO: maybe soft match or another way to detect redirects?
      // @TODO: maybe distinguish between soft redirects (unauthorized) and hard redirects (301)?
      if (canonical !== furl) {
        // @NOTE: there is no dedicated API to cancel the rendering, so we throw to signal redirect
        // @TODO: document types of throwable objects
        throw {
          type: 'redirect',
          path: canonical,
        };
      }

      // @NOTE: retrieve status code
      var status = route.meta.status;
      if (status == null) {
        status = 200;
      }

      // @NOTE: after routing and prefetching is done, we report the results
      //        back to the bundler

      context.status = status;

      // @FIXME: implement
      context.helmet = {
        lang: 'en',
        title: 'Hello from Vue!',
        canonical: canonical,
        meta: [
          { name: 'description', content: 'Description' },
        ],
      };

      context.initialState = store.state;
      context.routeDataCache = routeData.cache;

      return vm;
    });
};
