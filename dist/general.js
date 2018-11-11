"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.decorateWithPathAndProxy = exports.addPathProp = exports.makePath = exports.isArray = exports.isObject = void 0;

var _constants = require("./constants");

var _proxy = require("./proxy");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var isObject = function isObject(item) {
  return item && _typeof(item) === 'object' && item.constructor === Object;
};

exports.isObject = isObject;

var isArray = function isArray(item) {
  return Array.isArray(item);
};

exports.isArray = isArray;

var makePath = function makePath(target, prop) {
  if (prop) {
    return [target[_constants.PATH_PROP], prop].join(_constants.SEP);
  }

  return target[_constants.PATH_PROP];
};

exports.makePath = makePath;

var addPathProp = function addPathProp(item, value) {
  Object.defineProperty(item, _constants.PATH_PROP, {
    value: value,
    writable: true // paths can be updated. E.g. store.tasks.2 could become store.tasks.1

  });
};

exports.addPathProp = addPathProp;

var decorateWithPathAndProxy = function decorateWithPathAndProxy(parentObject, parentPath) {
  var decorateObject = function decorateObject(item, path) {
    if (isArray(item) || isObject(item)) {
      if (isArray(item)) {
        var nextArray = item.map(function (itemEntry, i) {
          return (0, _proxy.createProxy)(decorateObject(itemEntry, "".concat(path, ".").concat(i)));
        });
        addPathProp(nextArray, path);
        return (0, _proxy.createProxy)(nextArray);
      }

      var newObject = {}; // TODO (davidg): reduce

      Object.entries(item).forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            prop = _ref2[0],
            value = _ref2[1];

        newObject[prop] = (0, _proxy.createProxy)(decorateObject(value, "".concat(path, ".").concat(prop)));
      });
      addPathProp(newObject, path);
      return (0, _proxy.createProxy)(newObject);
    } else {
      return item;
    }
  };

  return decorateObject(parentObject, parentPath);
};

exports.decorateWithPathAndProxy = decorateWithPathAndProxy;