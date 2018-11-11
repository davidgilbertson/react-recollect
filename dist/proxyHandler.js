"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logging = require("./logging");

var _general = require("./general");

var _proxy = require("./proxy");

var _collect = require("./collect");

var _updating = require("./updating");

var _store = require("./store");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var proxyHandler = {
  get: function get(target, prop) {
    if ((0, _proxy.isProxyMuted)() || !(0, _collect.getCurrentComponent)() || _typeof(prop) === 'symbol' || // TODO (davidg): 'constructor' is reserved, what's the other reserved one?
    prop === 'constructor') {
      return Reflect.get(target, prop);
    }

    _logging.log.info("---- GET ----");

    _logging.log.info('GET component:', (0, _collect.getCurrentComponent)()._name);

    _logging.log.info('GET target:', target);

    _logging.log.info('GET prop:', prop);

    if (Array.isArray(target)) {
      // If the TARGET is an array, e.g. if a component
      // checks someArray.length OR uses someArray.forEach() or .map() or .reduce(), etc.
      // Then it needs to be notified when the length changes
      (0, _updating.addListener)(target, 'length');
    } else {
      // otherwise, add a listener for whenever the target/prop is
      (0, _updating.addListener)(target, prop);
    }

    return Reflect.get(target, prop);
  },
  has: function has(target, prop) {
    if ((0, _proxy.isProxyMuted)()) return Reflect.has(target, prop); // has() also gets called when looping over an array. We don't care about that

    if (!Array.isArray(target)) {
      _logging.log.info("---- HAS ----");

      _logging.log.info('HAS target:', target);

      _logging.log.info('HAS prop:', prop);

      (0, _updating.addListener)(target, prop);
    }

    return Reflect.has(target, prop);
  },
  set: function set(target, prop, value) {
    if ((0, _proxy.isProxyMuted)()) return Reflect.set(target, prop, value);
    var path = (0, _general.makePath)(target, prop); // Add paths to this new value

    var newProxiedValue = (0, _general.decorateWithPathAndProxy)(value, path);

    _logging.log.info("---- SET ----");

    _logging.log.info('SET target:', target);

    _logging.log.info('SET prop:', prop);

    _logging.log.info('SET from:', target[prop]);

    _logging.log.info('SET to:', newProxiedValue);

    var newStore = (0, _store.updateStoreAtPath)({
      path: path,
      value: newProxiedValue
    });
    (0, _updating.notifyByPath)({
      path: path,
      newStore: newStore
    });
    return true;
  },
  deleteProperty: function deleteProperty(target, prop) {
    if ((0, _proxy.isProxyMuted)()) return Reflect.deleteProperty(target, prop);

    _logging.log.info("---- DELETE ----");

    _logging.log.info('DELETE target:', target);

    _logging.log.info('DELETE prop:', prop);

    var path = (0, _general.makePath)(target, prop);
    var newStore = (0, _store.updateStoreAtPath)({
      path: path,
      deleteItem: true
    });
    (0, _updating.notifyByPath)({
      path: path,
      newStore: newStore
    });
    return true;
  }
};
var _default = proxyHandler;
exports.default = _default;