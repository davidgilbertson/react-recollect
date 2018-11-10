"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "afterChange", {
  enumerable: true,
  get: function get() {
    return _updating.afterChange;
  }
});
Object.defineProperty(exports, "store", {
  enumerable: true,
  get: function get() {
    return _store.store;
  }
});
Object.defineProperty(exports, "collect", {
  enumerable: true,
  get: function get() {
    return _collect.collect;
  }
});

var _react = _interopRequireDefault(require("react"));

var _logging = require("./logging");

var _updating = require("./updating");

var _store = require("./store");

var _collect = require("./collect");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

window.__RR__ = {
  getStore: _store.getStore,
  getListeners: _updating.getListeners,
  debugOn: _logging.debugOn,
  debugOff: _logging.debugOff
};