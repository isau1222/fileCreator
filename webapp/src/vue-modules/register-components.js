var requirePartial = require.context('@/partials', true, /\.vue$/);
registerComponents(requirePartial, 'partial');

var requireWidget = require.context('@/widgets', true, /\.vue$/);
registerComponents(requireWidget, 'widget');

function registerComponents(req, keyword) {
  var paths = req.keys();

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    var component = req(path);
    var name = translatePathToName(path);

    if (name.indexOf('/') === -1) {
      Vue.component(name, component);
    }
    else {
      console.warn('[register-all] ' + keyword + ' ' + name + ' can not be required automatically, because it is in the folder');
    }
  }
}

function translatePathToName(filepath) {
  return filepath
    .replace(/^.\//, '') // @NOTE: strip initial `./`
    .replace(/\.vue$/, '') // @NOTE: strip terminal `.vue`
    ;
}
