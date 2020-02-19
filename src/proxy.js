import * as utils from 'src/shared/utils';
import { addPathProp } from 'src/shared/general';

const proxies = new WeakSet();

export const isProxy = obj => proxies.has(obj);

const canBeProxied = item =>
  (utils.isPlainObject(item) ||
    utils.isArray(item) ||
    utils.isMap(item) ||
    utils.isSet(item) ||
    utils.isFunction(item)) && // TODO (davidg): do I ever generically do this?
  !isProxy(item);

/**
 * This will _maybe_ create a proxy. If an item can't be proxied, it will be returned as is.
 * @param obj - the item to be proxied
 * @param {object} handler - the item to be proxied
 * @returns {*}
 */
export const createProxy = (obj, handler) => {
  if (!canBeProxied(obj)) return obj;

  const proxy = new Proxy(obj, handler);
  proxies.add(proxy);
  return proxy;
};

/**
 *
 * @param {*} parentObject
 * @param parentPath
 * @param handler
 * @return {*}
 */
export const decorateWithPathAndProxy = (parentObject, parentPath, handler) => {
  const decorateObject = (item, path) => {
    // TODO (davidg): canBeProxied() exists
    if (
      utils.isArray(item) ||
      utils.isPlainObject(item) ||
      utils.isMap(item) ||
      utils.isSet(item)
    ) {
      if (utils.isArray(item)) {
        const nextArray = item.map((itemEntry, i) => {
          return createProxy(decorateObject(itemEntry, [...path, i]), handler);
        });

        addPathProp(nextArray, path);
        return createProxy(nextArray, handler);
      }

      if (utils.isMap(item)) {
        addPathProp(item, path);
        return createProxy(item, handler);
      }

      if (utils.isSet(item)) {
        addPathProp(item, path);
        return createProxy(item, handler);
      }

      const newObject = {}; // TODO (davidg): reduce

      // TODO (davidg): is this necessary? Does the proxy not look after itself when calling set
      //  on children
      Object.entries(item).forEach(([prop, value]) => {
        newObject[prop] = createProxy(
          decorateObject(value, [...path, prop]),
          handler
        );
      });

      addPathProp(newObject, path);

      return createProxy(newObject, handler);
    }
    return item;
  };

  return decorateObject(parentObject, parentPath);
};
