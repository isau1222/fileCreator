var App = {};

if (typeof window !== 'undefined') {
  window.App = App;
}

var services = require.context('@/services', true, /\.js$/);
_.each(services.keys(), path => {
  _.extend(App, services(path));
});

module.exports = App;
