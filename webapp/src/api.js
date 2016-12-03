var Vue = require('vue');
var axios = require('axios');

// === //

function VueApi(options) {
  if (options === undefined) options = {};
  if (options.baseURL === undefined) options.baseURL = '/';

  this.options = options;
  this.axios = axios.create({
    baseURL: options.baseURL,
    validateStatus: function(status) {
      return (status < 500);
    },
  });
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

VueApi.prototype.isSuccess = function(response) {
  return response && (response.status >= 200) && (response.status < 300);
};

VueApi.prototype.isFailure = function(response) {
  return response && (response.status >= 400) && (response.status < 500);
};

VueApi.install = install;

function install(Vue) {
  if (install.installed) return;
  install.installed = true;

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

module.exports = new VueApi({
  baseURL: process.env.APP_API_PUBLIC_PATH,
});
