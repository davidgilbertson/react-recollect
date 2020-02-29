import * as utils from './shared/utils';
import * as paths from './shared/paths';
import { ObjWithSymbols, PropPath, Target } from './shared/types';

const proxies = new WeakSet();

export const isProxy = (obj: any): boolean => proxies.has(obj);

export const canBeProxied = (item: any) =>
  (utils.isPlainObject(item) ||
    utils.isArray(item) ||
    utils.isMap(item) ||
    utils.isSet(item) ||
    utils.isFunction(item)) && // TODO (davidg): do I ever generically do this?
  !isProxy(item);

/**
 * This will _maybe_ create a proxy. If an item can't be proxied, it will be returned as is.
 */
// TODO (davidg): this is not wonderfully typed. We might not even need
//  a handler, and it's fine for obj to not extend object (e.g. be a string)
export const createProxy = <T extends object>(
  obj: T,
  handler: ProxyHandler<T>
): T => {
  if (!canBeProxied(obj)) return obj;

  const proxy = new Proxy(obj, handler);
  proxies.add(proxy);
  return proxy;
};

export const decorateWithSymbolsAndProxy = <T extends Target>(
  parentObject: T,
  parentPath: PropPath,
  handler: ProxyHandler<T>
): T => {
  const decorateObject = (item: any, path: PropPath) => {
    // TODO (davidg): canBeProxied() exists

    if (utils.isArray(item)) {
      const nextArray = item.map((itemEntry, i) => {
        return createProxy(decorateObject(itemEntry, [...path, i]), handler);
      }) as T;

      paths.addProp(nextArray, path);
      return createProxy(nextArray, handler);
    }

    if (utils.isMap(item)) {
      paths.addProp(item, path);
      // @ts-ignore - must fix these. Potentially wrong handler for the item
      return createProxy(item, handler);
    }

    if (utils.isSet(item)) {
      paths.addProp(item, path);
      // @ts-ignore - must fix these. Potentially wrong handler for the item
      return createProxy(item, handler);
    }

    if (utils.isPlainObject(item)) {
      const newObject = {} as ObjWithSymbols;

      // TODO (davidg): is this necessary? Does the proxy not look after itself when calling set
      //  on children
      // TODO (davidg): yeah, this is wrong, it applies the same handler
      //  to all children, but the handler is only for parentObject. Write
      //  a test that fails. An array with Map children?
      Object.entries(item).forEach(([prop, value]) => {
        newObject[prop] = createProxy(
          decorateObject(value, [...path, prop]),
          handler
        );
      });

      paths.addProp(newObject, path);

      // We return "as T" because we know this is the same type
      return createProxy(newObject, handler) as T;
    }

    return item;
  };

  return decorateObject(parentObject, parentPath);
};
