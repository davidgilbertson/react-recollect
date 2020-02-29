import { PATH_PATH_SYMBOL, PROP_PATH_SEP } from './constants';
import { PropPath, Target } from './types';

/**
 * Convert a target and a prop into a user-friendly string like store.tasks.1.done
 */
export const makeUserString = (propPath: PropPath) => propPath.join('.');

export const makeInternalString = (propPath: PropPath) =>
  propPath.join(PROP_PATH_SEP);

/**
 * Takes the path stored in an object, and a new prop, and returns the two
 * combined
 */
export const extend = (obj: Target, prop?: any): PropPath => {
  const basePath = obj[PATH_PATH_SYMBOL] || [];

  if (typeof prop === 'undefined') return basePath;

  return basePath.concat(prop);
};

/**
 * Convert a obj and a prop into a user-friendly string like store.tasks.1.done
 */
export const extendToUserString = (obj: Target, prop?: any): string =>
  makeUserString(extend(obj, prop));

export const addProp = (item: object, propPath: PropPath) => {
  Object.defineProperty(item, PATH_PATH_SYMBOL, {
    value: propPath,
    writable: true, // paths can be updated. E.g. store.tasks.2 could become store.tasks.1
  });
};

export const get = (obj: Target) => obj[PATH_PATH_SYMBOL] || [];

export const has = (obj: Target) => PATH_PATH_SYMBOL in obj;

export const set = (mutableTarget: Target, propPath: PropPath) => {
  mutableTarget[PATH_PATH_SYMBOL] = propPath;
};
