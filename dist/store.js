"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNextStore = exports.setNextStore = exports.setStore = exports.getStore = exports.updateStoreAtPath = exports.store = void 0;

var _proxy = require("./proxy");

var _general = require("./general");

var _constants = require("./constants");

var rawStore = {};
(0, _general.addPathProp)(rawStore, 'store');
var store = (0, _proxy.createProxy)(rawStore);
exports.store = store;
var nextStore;

var updateStoreAtPath = function updateStoreAtPath(_ref) {
  var path = _ref.path,
      value = _ref.value,
      deleteItem = _ref.deleteItem;
  (0, _proxy.muteProxy)();
  var propArray = path.split(_constants.SEP);
  propArray.shift(); // we don't need 'store'.

  var update = function update(target, i) {
    if (i === propArray.length) return (0, _proxy.createProxy)(value); // value might be [] or {}

    var isLastProp = i === propArray.length - 1;
    var thisProp = propArray[i];
    var targetClone; // We'll be cloning proxied objects with non-enumerable props
    // So we need to add these things back after cloning

    if (Array.isArray(target)) {
      targetClone = (0, _proxy.createProxy)(target.slice());
      (0, _general.addPathProp)(targetClone, target[_constants.PATH_PROP]); // If this is adding something to an array

      if (isLastProp && thisProp >= target.length) {
        // const isObjectOrArray = Array.isArray(value) || isObject(value);
        // targetClone[thisProp] = isObjectOrArray ? createProxy(value) : value;
        targetClone[thisProp] = (0, _proxy.createProxy)(value); // TODO (davidg): add path?

        return targetClone;
      }
    } else {
      targetClone = Object.assign({}, target);

      if ((0, _proxy.isProxy)(target) && !(0, _proxy.isProxy)(targetClone)) {
        targetClone = (0, _proxy.createProxy)(targetClone);
      }

      (0, _general.addPathProp)(targetClone, target[_constants.PATH_PROP]);
    }

    if (i === propArray.length - 1 && deleteItem) {
      delete targetClone[thisProp];
      return targetClone;
    }

    var next = target[thisProp] === undefined ? {} : target[thisProp];
    targetClone[thisProp] = update(next, i + 1);
    return targetClone;
  };

  var newStore = update(store, 0);
  (0, _general.addPathProp)(newStore, 'store');
  (0, _proxy.unMuteProxy)();
  return (0, _proxy.createProxy)(newStore);
};

exports.updateStoreAtPath = updateStoreAtPath;

var getStore = function getStore() {
  return store;
};
/**
 * Replace the contents of the old store with the new store.
 * DO NOT replace the old store object since the user's app will have a reference to it
 * @param next
 */


exports.getStore = getStore;

var setStore = function setStore(next) {
  (0, _proxy.muteProxy)();
  Object.keys(store).forEach(function (prop) {
    delete store[prop];
  });
  Object.keys(next).forEach(function (prop) {
    store[prop] = next[prop];
  });
  (0, _proxy.unMuteProxy)();
};

exports.setStore = setStore;

var setNextStore = function setNextStore(next) {
  nextStore = next;
}; // TODO (davidg):  should getStore() just do nextStore || store?
// will getStore ever be called to get the last one?


exports.setNextStore = setNextStore;

var getNextStore = function getNextStore() {
  return nextStore || store;
};

exports.getNextStore = getNextStore;