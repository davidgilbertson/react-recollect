"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeListenersForComponent = exports.notifyByPathStart = exports.notifyByPath = exports.updateComponents = exports.afterChange = exports.addListener = exports.getListeners = void 0;

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
    // TODO (davidg): consider set or WeakSet instead of array? Easier to delete a component?
    // And no need to check for duplicates?
    listeners[path].push((0, _collect.getCurrentComponent)());
  } else {
    listeners[path] = [(0, _collect.getCurrentComponent)()];
  }
};

exports.addListener = addListener;

var afterChange = function afterChange(cb) {
  manualListeners.push(cb);
};

exports.afterChange = afterChange;

var updateComponents = function updateComponents(_ref) {
  var components = _ref.components,
      path = _ref.path,
      newStore = _ref.newStore;
  if (!components) return; // components can have duplicates, so take care to only update once each.

  var updated = [];
  components.forEach(function (component) {
    if (updated.includes(component)) return;
    updated.push(component);

    _logging.log.info("---- UPDATE ----");

    _logging.log.info("UPDATE <".concat(component._name, ">:"));

    _logging.log.info("UPDATE path: ".concat(path));

    component.setState({
      store: newStore
    });
  });
};

exports.updateComponents = updateComponents;

var notifyByPath = function notifyByPath(_ref2) {
  var path = _ref2.path,
      newStore = _ref2.newStore;
  var components = [];

  for (var listenerPath in listeners) {
    if (path === listenerPath || path.startsWith("".concat(listenerPath, "."))) {
      components = components.concat(listeners[listenerPath]);
    }
  }

  updateComponents({
    components: components,
    path: path,
    newStore: newStore
  }); // store = newStore;

  (0, _store.setStore)(newStore);
  manualListeners.forEach(function (cb) {
    return cb(newStore, path);
  });
};

exports.notifyByPath = notifyByPath;

var notifyByPathStart = function notifyByPathStart(_ref3) {
  var parentPath = _ref3.parentPath,
      newStore = _ref3.newStore;
  var components = [];

  for (var listenerPath in listeners) {
    if (listenerPath.startsWith("".concat(parentPath, "."))) {
      components = components.concat(listeners[listenerPath]);
    }
  }

  updateComponents({
    components: components,
    path: parentPath,
    newStore: newStore
  }); // store = newStore;

  (0, _store.setStore)(newStore);
  manualListeners.forEach(function (cb) {
    return cb(newStore, parentPath);
  });
};

exports.notifyByPathStart = notifyByPathStart;

var removeListenersForComponent = function removeListenersForComponent(component) {
  for (var path in listeners) {
    listeners[path] = listeners[path].filter(function (listeningComponent) {
      return listeningComponent !== component;
    });
  }
};

exports.removeListenersForComponent = removeListenersForComponent;