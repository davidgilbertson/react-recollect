"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeListenersForComponent = exports.notifyByPath = exports.afterChange = exports.addListener = exports.getListeners = void 0;

var _collect = require("./collect");

var _general = require("./general");

var _logging = require("./logging");

var _store = require("./store");

var listeners = {
  store: []
};
var manualListeners = [];

var getListeners = function getListeners() {
  return listeners;
};

exports.getListeners = getListeners;

var addListener = function addListener(target, prop) {
  if (!(0, _collect.getCurrentComponent)()) return;
  var path = (0, _general.makePath)(target, prop);

  if (listeners[path]) {
    // TODO (davidg): consider Set or WeakSet instead of array? Easier to delete a component?
    // And no need to check for duplicates?
    listeners[path].push((0, _collect.getCurrentComponent)());
  } else {
    listeners[path] = [(0, _collect.getCurrentComponent)()];
  }
};

exports.addListener = addListener;

var afterChange = function afterChange(cb) {
  manualListeners.push(cb);
}; // TODO (davidg): remember why I can't batch updates. It was something to do with a component
// only listening on one prop, so not seeing changes to other props. See scatter-bar checking for
// if (!store.stories || !store.currentStoryIndex) return null. But I forget why exactly. Write
// a test for this scenario


exports.afterChange = afterChange;

var updateComponents = function updateComponents(_ref) {
  var components = _ref.components,
      path = _ref.path,
      newStore = _ref.newStore;
  // This is for other components that might render as a result of these updates.
  (0, _store.setNextStore)(newStore); // components can have duplicates, so take care to only update once each.

  var updated = [];

  if (components) {
    components.forEach(function (component) {
      if (updated.includes(component)) return;
      updated.push(component);

      _logging.log.info("---- UPDATE ----");

      _logging.log.info("UPDATE <".concat(component._name, ">:"));

      _logging.log.info("UPDATE path: ".concat(path));

      component.update(newStore);
    });
  }

  (0, _store.setStore)(newStore); // pass the path too, just useful for testing/debugging

  manualListeners.forEach(function (cb) {
    return cb(newStore, path);
  });
};
/**
 * Updates any component listening to:
 * - the exact propPath that has been changed. E.g. store.tasks.2
 * - a path further up the object tree. E.g. store.tasks
 * - a path further down the object tree. E.g. store.tasks.2.name (only when
 * @param {object} props
 * @param {string} props.path - The path of the prop that changed
 * @param {object} props.newStore - The next version of the store
 */


var notifyByPath = function notifyByPath(_ref2) {
  var path = _ref2.path,
      newStore = _ref2.newStore;
  var components = [];

  for (var listenerPath in listeners) {
    if (path === listenerPath || path.startsWith("".concat(listenerPath, ".")) || listenerPath.startsWith("".concat(path, ".")) // TODO (davidg): this is wasteful a lot of the time
    ) {
        components = components.concat(listeners[listenerPath]);
      }
  }

  updateComponents({
    components: components,
    path: path,
    newStore: newStore
  });
};

exports.notifyByPath = notifyByPath;

var removeListenersForComponent = function removeListenersForComponent(component) {
  for (var path in listeners) {
    listeners[path] = listeners[path].filter(function (listeningComponent) {
      return listeningComponent !== component;
    });
  }
};

exports.removeListenersForComponent = removeListenersForComponent;