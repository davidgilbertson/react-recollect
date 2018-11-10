"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setStore = exports.getStore = exports.updateStoreAtPath = exports.store = void 0;

var _proxy = require("./proxy");

var _general = require("./general");

var _constants = require("./constants");

var rawStore = {};
(0, _general.addPathProp)(rawStore, 'store');
var store = (0, _proxy.createProxy)(rawStore); // Thanks to https://github.com/debitoor/dot-prop-immutable

exports.store = store;

var updateStoreAtPath = function updateStoreAtPath(_ref) {
  var path = _ref.path,
      value = _ref.value,
      deleteItem = _ref.deleteItem;
  // muteProxy = true; // don't need to keep logging gets.
  (0, _proxy.muteProxy)();
  var propArray = path.split(_constants.SEP);
  propArray.shift(); // we don't need 'store'.

  var update = function update(target, i) {
    if (i === propArray.length) return value;
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
  (0, _general.addPathProp)(newStore, 'store'); // muteProxy = false;

  (0, _proxy.unMuteProxy)(); // The clone of the top level won't be a proxy object
  // TODO (davidg): actually newStore will already be a proxy, no?

  if ((0, _proxy.isProxy)(newStore)) {
    return newStore;
  }

  console.log('Well this is unexpected, the store is not a proxy?');
  return (0, _proxy.createProxy)(newStore);
};

exports.updateStoreAtPath = updateStoreAtPath;

var getStore = function getStore() {
  return store;
};

exports.getStore = getStore;

var setStore = function setStore(newStore) {
  exports.store = store = newStore;
};

exports.setStore = setStore;