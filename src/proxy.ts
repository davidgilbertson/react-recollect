import * as utils from './shared/utils';
import * as paths from './shared/paths';
import { PropPath, ProxiedTarget, Target } from './shared/types';
import { IS_PROXY } from './shared/constants';
import { getHandlerForObject } from './proxyHandlers';
import { isProxyable } from './shared/utils';

type CreateShallow = {
  <T extends Target>(item: T): ProxiedTarget<T>; // can be proxied
  <T extends any>(item: T): T; // can't be proxied
};

export const createShallow: CreateShallow = <T extends any>(
  item: T
): T | ProxiedTarget<T> => {
  if (!item || item[IS_PROXY]) return item;

  if (!utils.isProxyable(item)) return item;

  const handler = getHandlerForObject(item);

  // We add the property like this so that's is removed when shallow cloning
  // the object
  Object.defineProperty(item, IS_PROXY, {
    value: true,
  });

  return new Proxy(item as Target, handler) as ProxiedTarget<T>;
};

export const createDeep = <T extends Target>(
  parentObject: T,
  parentPropPath: PropPath = []
): ProxiedTarget<T> => {
  const proxyThisLevel = <U extends any>(
    target: U,
    propPath: PropPath
  ): ProxiedTarget<U> => {
    if (!isProxyable(target)) return target;

    let next = target;

    if (utils.isPlainObject(target)) {
      next = {} as U; // U is ObjWithSymbols

      Object.entries(target).forEach(([prop, value]) => {
        next[prop] = proxyThisLevel(value, [...propPath, prop]);
      });
    }

    if (utils.isArray(target)) {
      next = target.map((item: any, i: number) => {
        return proxyThisLevel(item, [...propPath, i]);
      }) as U; // U is ArrWithSymbols
    }

    if (utils.isMap(target)) {
      // @ts-ignore - U is MapWithSymbols
      next = new Map() as U;

      target.forEach((value: any, key: any) => {
        next.set(key, proxyThisLevel(value, [...propPath, key]));
      });
    }

    if (utils.isSet(target)) {
      // @ts-ignore - U is SetWithSymbols
      next = new Set() as U;

      target.forEach((value: any, i: number) => {
        next.add(proxyThisLevel(value, [...propPath, i]));
      });
    }

    if (propPath.length) paths.addProp(next, propPath);

    return createShallow(next);
  };

  return proxyThisLevel(parentObject, parentPropPath);
};
