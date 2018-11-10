import { isObject } from './general';
import proxyHandler from './proxyHandler';

const proxies = new WeakSet();
let muted = false;

export const isProxy = obj => proxies.has(obj);

export const canBeProxied = item => (isObject(item) || Array.isArray(item)) && !isProxy(item);

export const createProxy = (obj) => {
  if (!canBeProxied(obj)) return obj;

  const proxy = new Proxy(obj, proxyHandler);
  proxies.add(proxy);
  return proxy;
};

export const muteProxy = () => {
  muted = true;
};

export const unMuteProxy = () => {
  muted = false;
};

export const isProxyMuted = () => muted;
