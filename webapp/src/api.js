var axios = require('axios');

// === //

function VueApi(options) {
  this.options = options;
  this.axios = axios.create(options);
}

var methods = ['request', 'get', 'delete', 'head', 'post', 'put', 'patch'];
methods.forEach(function(method) {
  VueApi.prototype[method] = function() {
    return this.axios[method].apply(this.axios, arguments);
  };
});

VueApi.prototype.isConnectivityError = function(err) {
  return err.config && (err.response == undefined); // @NOTE: double equal
};

VueApi.prototype.isServerError = function(err) {
  return err.config && err.response && (err.response.status >= 500);
};

VueApi.prototype.isFailure = function(err) {
  return err.config && err.response && (err.response.status >= 400) && (err.response.status < 500);
};

VueApi.prototype.isSuccess = function(response) {
  return response && (response.status >= 200) && (response.status < 300);
};

VueApi.install = install;

function install(Vue) {
  if (install.installed) return;
  install.installed = true;

  if (Object.getOwnPropertyDescriptor(Vue.prototype, '$api')) {
    // @NOTE: already defined
    return;
  }

  Object.defineProperty(Vue.prototype, '$api', {
    get: function() {
      return this.$root._api;
    },
  });

  Vue.mixin({
    beforeCreate: function() {
      if (this.$options.api) {
        this._api = this.$options.api;
      }
    },
  });
}

// === //

Vue.use(VueApi);

var api = new VueApi({
  baseURL: process.env.APP_API_PUBLIC_PATH,
  // @TODO: set default content type to application/json
});

// === //

module.exports = api;
