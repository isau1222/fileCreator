function VueRouteData(opts) {
  var self = this;

  // @NOTE: a flag that should be set by the developer to mark when rehydration takes place
  self.rehydration = false;

  // @NOTE: a data cache, that should be sent along with prerendered app, and picked up during rehydration
  self.cache = {};

  self.pack = opts.pack;
  self.unpack = opts.unpack;

  // @NOTE: mixin factory
  self.makeMixin = function(opts) {
    // @NOTE: result and error, returned from the fetch, should be serializable

    // @TODO: evaluate the need for separate prefetch/fetch paths for cases when metadata is required
    //        for routing (e.g. the existence of a resource and it's title), and details can be fetched later

    // @TODO: rework the API when it becomes possible to get component from a `beforeRouteEnter` hook:
    //        - expose a plugin with global mixin and per-component configuration instead of a mixin factory
    //        - infer key automatically from the component name
    //        - store the cache reference in the root instead of the custom instance

    // @TODO: rework the API when `next(vm => ...)` from a route guard will prerender during SSR
    //        - separation of process/update won't be needed, but process will keep the `next` callback in the signature
    //           - when data is prefetched, it will be just a route guard
    //           - when data is not prefetched, it will only support `next(vm => ...)`, and will warn when used in other way

    if (opts.reuse === undefined) {
      opts.reuse = true;
    }

    if (opts.prefetch === undefined) {
      opts.prefetch = false;
    }

    var failed = false;

    if (!opts.key) {
      console.error('[vue-router-data] `key` is required, but is not present on', opts);
      failed = true;
    }

    if (!_.isFunction(opts.fetch)) {
      console.error('[vue-router-data] `fetch` is expected to be a function, but given', opts.fetch, 'in', opts);
      failed = true;
    }

    if (!_.isFunction(opts.update)) {
      console.error('[vue-router-data] `update` is expected to be a function, but given', opts.fetch, 'in', opts);
      failed = true;
    }

    if (opts.process && !_.isFunction(opts.process)) {
      console.error('[vue-router-data] `update` is expected to be a function, but given', opts.fetch, 'in', opts);
    }

    if (failed) {
      console.error('[vue-router-data] was not able to create a mixin for', opts);
      return;
    }

    return {
      beforeRouteEnter: function(to, from, next) {
        var shouldFetch = true;
        var shouldProceed = false;

        if (self.rehydration && opts.prefetch) {
          // @NOTE: data should have already been prefetched by the server
          shouldFetch = false;
        }

        if (process.env.VUE_ENV === 'server' && !opts.prefetch) {
          // @NOTE: server should not prefetch unnecessary data
          shouldFetch = false;
        }

        if (process.env.VUE_ENV === 'client' && !opts.prefetch) {
          // @NOTE: non-prefetched data should not suspend the guard,
          //        and the data be updated dynamically
          shouldProceed = true;
        }

        // @NOTE: bail out if wee don't need data
        if (!shouldFetch) {
          return next();
        }

        var vm; // @NOTE: to be filled later if we want to proceed

        Promise.resolve()
          .then(function() {
            if (shouldProceed) {
              // @NOTE: we want to update dynamically, so we need to proceed the guard
              //        and wait for the instance to be created
              return new Promise(function(resolve) {
                return next(function(_vm) {
                  vm = _vm;
                  return resolve();
                });
              });
            }
          })
          .then(function() {
            return Promise.resolve()
              .then(function() {
                return opts.fetch(to, from);
              })
              .then(function(result) {
                self.set(opts.key, { result: result });
              })
              .catch(function(err) {
                self.set(opts.key, { err: err });
              });
          })
          .then(function() {
            var cached = self.get(opts.key);

            if (shouldProceed) {
              // @NOTE: we have proceeded the guard earlier, so instance should already exist,
              //        and we just call update on it
              // @NOTE: this may break if vue-router decides to SSR the data that was set from the `next` callback
              // @FIXME: check if instance still exists
              opts.update.call(vm, cached.err, cached.result);
            }
            else {
              // @NOTE: we are still holding the guard, and the instance does not exist yet,
              //        so we don't call the `update` here, it will be called in the `created` hook
              if (opts.process) {
                return opts.process(cached.err, cached.result, next);
              }
              else {
                return next();
              }
            }
          })
          .catch(function(err) {
            // @TODO: log application failure
            if (shouldProceed) {
              console.error('[vue-route-data] unexpected error:', err, 'when processing `beforeRouteEnter` of', vm);
            }
            else {
              console.error('[vue-route-data] unexpected error:', err, 'when processing `beforeRouteEnter` of some component');
            }
            return next(false); // @NOTE: abort
          });
      },
      beforeRouteUpdate: function(to, from, next) {
        // @TODO: test if `beforeRouteUpdate` ever happens on the server

        var shouldFetch;
        var shouldProceed = false;

        if (_.isFunction(opts.reuse)) {
          shouldFetch = !opts.reuse(to, from);
        }
        else {
          shouldFetch = !opts.reuse;
        }

        if (!opts.prefetch) {
          // @NOTE: non-prefetched data should not suspend the guard,
          //        and the data be updated dynamically
          shouldProceed = true;
        }

        // @NOTE: bail out if we don't need new data
        if (!shouldFetch) {
          return next();
        }

        var vm; // @NOTE: to be filled later if we want to proceed

        Promise.resolve()
          .then(function() {
            if (shouldProceed) {
              // @NOTE: we want to update dynamically, so we need to proceed the guard
              //        and wait for the instance to be created
              return new Promise(function(resolve) {
                return next(function(_vm) {
                  vm = _vm;
                  return resolve();
                });
              });
            }
          })
          .then(function() {
            return Promise.resolve()
              .then(function() {
                return opts.fetch(to, from);
              })
              .then(function(result) {
                self.set(opts.key, { result: result });
              })
              .catch(function(err) {
                self.set(opts.key, { err: err });
              });
          })
          .then(function() {
            var cached = self.get(opts.key);

            if (shouldProceed) {
              // @NOTE: we have proceeded the guard earlier, so instance should already exist,
              //        and we just call update on it
              // @NOTE: this may break if vue-router decides to SSR the data that was set from the `next` callback
              // @FIXME: check if instance still exists
              opts.update.call(vm, cached.err, cached.result);
            }
            else {
              // @NOTE: we are still holding the guard, and the instance does not exist yet,
              //        but instance is already created (because it's `beforeRouteUpdate`)
              //        so we wait for the instance to settle and then call the `update`
              if (opts.process) {
                return opts.process(cached.err, cached.result, next2);
              }
              else {
                return next2();
              }
            }

            function next2(target) {
              // @TODO: test if there are cases when this causes data loss (e.g. `null` or `true`)
              // @FIXME: handle `next(vm => { ... })`
              if (target != null) {
                return next(target);
              }
              else {
                return next(function(_vm) {
                  opts.update.call(_vm, cached.err, cached.result);
                });
              }
            }
          })
          .catch(function(err) {
            // @TODO: log application failure
            if (shouldProceed) {
              console.error('[vue-route-data] unexpected error:', err, 'when processing `beforeRouteUpdate` of', vm);
            }
            else {
              console.error('[vue-route-data] unexpected error:', err, 'when processing `beforeRouteUpdate` of some component');
            }
            return next(false); // @NOTE: abort
          });
      },
      created: function() {
        // @NOTE: update the instance if the data was prefetched,
        //        otherwise it would be updated dynamically later
        if (opts.prefetch) {
          var cached = self.get(opts.key);
          opts.update.call(this, cached.err, cached.result);
        }
      },
    };
  };
}

VueRouteData.prototype.get = function(key) {
  var value = this.cache[key];
  if (this.unpack) {
    value = this.unpack(value);
  }
  return value;
};

VueRouteData.prototype.set = function(key, value) {
  if (this.pack) {
    value = this.pack(value);
  }
  this.cache[key] = value;
};

// === //

var Errio = require('errio');
var assimilateError = require('assimilate-error');

var opts = {};

// @NOTE: include stack of server originated errors only in non-production environment
if (process.env.VUE_ENV === 'server') {
  if (process.env.NODE_ENV !== 'production') {
    opts.stack = true;
  }
}

// @NOTE: always include stack of client-originated errors
if (process.env.VUE_ENV === 'client') {
  opts.stack = true;
}

module.exports = new VueRouteData({
  pack: function(value) {
    var packed = {};

    if (value.err !== undefined) {
      packed.err = Errio.toObject(value.err, opts);
    }

    if (value.result !== undefined) {
      packed.result = value.result;
    }

    return packed;
  },
  unpack: function(packed) {
    var value = {};

    if (packed.err !== undefined) {
      var err = Errio.fromObject(packed.err, opts); // @TODO: see what happens when no stack is included
      if (packed.err.stack == null) {
        delete err.stack;
      }
      value.err = assimilateError(err, true);
    }

    if (packed.result !== undefined) {
      value.result = packed.result;
    }

    return value;
  },
});
