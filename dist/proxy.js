"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isProxyMuted = exports.unMuteProxy = exports.muteProxy = exports.createProxy = exports.canBeProxied = exports.isProxy = void 0;

var _general = require("./general");

var _proxyHandler = _interopRequireDefault(require("./proxyHandler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var proxies = new WeakSet();
var muted = false;

var isProxy = function isProxy(obj) {
  return proxies.has(obj);
};

exports.isProxy = isProxy;

var canBeProxied = function canBeProxied(item) {
  return ((0, _general.isObject)(item) || Array.isArray(item)) && !isProxy(item);
};

exports.canBeProxied = canBeProxied;

var createProxy = function createProxy(obj) {
  if (!canBeProxied(obj)) return obj;
  var proxy = new Proxy(obj, _proxyHandler.default);
  proxies.add(proxy);
  return proxy;
};

exports.createProxy = createProxy;

var muteProxy = function muteProxy() {
  muted = true;
};

exports.muteProxy = muteProxy;

var unMuteProxy = function unMuteProxy() {
  muted = false;
};

exports.unMuteProxy = unMuteProxy;

var isProxyMuted = function isProxyMuted() {
  return muted;
};

exports.isProxyMuted = isProxyMuted;