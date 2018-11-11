import { isObject } from './general';
import proxyHandler from './proxyHandler';

const proxies = new WeakSet();
let muted = false;

export const isProxy = obj => proxies.has(obj);

const canBeProxied = item => (isObject(item) || Array.isArray(item)) && !isProxy(item);

/**
 * This will _maybe_ create a proxy. If an item can't be proxied, it will be returned as is.
 * @param obj - the item to be proxied
 * @returns {*}
 */
export const createProxy = (obj) => {
  if (!canBeProxied(obj)) return obj;

  const proxy = new Proxy(obj, proxyHandler);
  proxies.add(proxy);
  return proxy;
};

/**
 * Mutes reads/writes to the proxied store
 * Do this to silence reads/writes that happen inside Recollect. The proxy only needs to listen
 * to changes happening in a user's code
 */
export const muteProxy = () => {
  muted = true;
};

/**
 * Un-mute the proxy
 */
export const unMuteProxy = () => {
  muted = false;
};

/**
 * Is proxy muting currently turned on?
 * @returns {boolean}
 */
export const isProxyMuted = () => muted;
