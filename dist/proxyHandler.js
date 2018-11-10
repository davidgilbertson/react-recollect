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

var _constants = require("./constants");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var proxyHandler = {
  get: function get(target, prop) {
    if ((0, _proxy.isProxyMuted)()) return Reflect.get(target, prop); // This will actually be called when reading PATH_PROP (so meta). Don't add a listener

    if (_typeof(prop) === 'symbol') return Reflect.get(target, prop); // TODO (davidg): 'constructor' is reserved, what's the other reserved one?

    if (prop === 'constructor') return Reflect.get(target, prop);

    _logging.log.info("---- GET ----");

    _logging.log.info('GET component:', (0, _collect.getCurrentComponent)() ? (0, _collect.getCurrentComponent)()._name : 'none');

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
    var path = (0, _general.makePath)(target, prop);
    var valueToSet = value; // Add paths to this new value

    var newProxiedValue = (0, _general.decorateWithPathAndProxy)(value, path);

    _logging.log.info("---- SET ----");

    _logging.log.info('SET target:', target);

    _logging.log.info('SET prop:', prop);

    _logging.log.info('SET from:', target[prop]);

    _logging.log.info('SET to:', newProxiedValue);

    if (Array.isArray(target)) {
      // Scenarios:
      // - target is array, prop is a number bigger than the array (adding an item, should update store by paths matching the parent)
      // - target is array, prop is length. Usually fired after some other update.
      // - target is array, prop is existing index, existing value is object. Then update all listeners for any properties on the object being replaced (by matching on the start of the path)
      if (prop === 'length') {
        if (newProxiedValue === 0) {
          console.log('I cannot do this trick yet!'); // TODO (davidg):
          // a special case of a user doing arr.length = 0; to empty an array

          valueToSet = []; // TODO (davidg): should be proxied
        } else {
          // otherwise probably fired by the JS engine after some other array change
          return true;
        }
      }

      if (!Number.isNaN(prop)) {
        var _newStore = (0, _store.updateStoreAtPath)({
          path: path,
          value: newProxiedValue
        }); // We're updating an object, to a new object
        // Now, we want anything that listens to any prop of the object in the array that is changing
        // to be updated
        // TODO (davidg): is this necessary any more? I'm no longer updating lower-level
        // components without updating their parents anyway.


        if ((0, _general.isObject)(target[prop]) && (0, _general.isObject)(value) || Number(prop) >= target.length) {
          (0, _updating.notifyByPathStart)({
            parentPath: target[_constants.PATH_PROP],
            newStore: _newStore
          });
          return true;
        }
      }
    } // TODO (davidg): this actually needs to be a 'deep proxy' and deep path setting as well
    // whenever the value is an array or object. I could do that here, or do it in updateStoreAtPath.
    // if (Array.isArray(value)) {
    //   // We are CREATING or REPLACING an array, so wrap it, and its items, in proxies
    //   // TODO: I can do this in `decorateWithPath` to save looping through twice
    //   const wrappedItems = value.map((item, i) => {
    //     // For example, there may have been an existing array of proxied objects,
    //     // then some new, non-proxied objects were added. We'll need to wrap some but not
    //     // others
    //     addPathProp(item, `${path}.${i}`); // We might be updating the path for this one
    //     return canBeProxied(item) ? createProxy(item, proxyHandler) : item;
    //   });
    //
    //   valueToSet = isProxy(wrappedItems) ? wrappedItems : createProxy(wrappedItems, proxyHandler);
    //
    //   // We just created a new array, so we need to set this, again. Could be done better.
    //   addPathProp(valueToSet, path);
    // }


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