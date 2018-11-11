"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isProxyMuted = exports.unMuteProxy = exports.muteProxy = exports.createProxy = exports.isProxy = void 0;

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
/**
 * This will _maybe_ create a proxy. If an item can't be proxied, it will be returned as is.
 * @param obj - the item to be proxied
 * @returns {*}
 */


var createProxy = function createProxy(obj) {
  if (!canBeProxied(obj)) return obj;
  var proxy = new Proxy(obj, _proxyHandler.default);
  proxies.add(proxy);
  return proxy;
};
/**
 * Mutes reads/writes to the proxied store
 * Do this to silence reads/writes that happen inside Recollect. The proxy only needs to listen
 * to changes happening in a user's code
 */


exports.createProxy = createProxy;

var muteProxy = function muteProxy() {
  muted = true;
};
/**
 * Un-mute the proxy
 */


exports.muteProxy = muteProxy;

var unMuteProxy = function unMuteProxy() {
  muted = false;
};
/**
 * Is proxy muting currently turned on?
 * @returns {boolean}
 */


exports.unMuteProxy = unMuteProxy;

var isProxyMuted = function isProxyMuted() {
  return muted;
};

exports.isProxyMuted = isProxyMuted;