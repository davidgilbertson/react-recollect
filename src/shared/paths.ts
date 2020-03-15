import { PATH, PROP_PATH_SEP } from './constants';
import { PropPath, Target } from './types';

// Joins an array that potentially contains symbols, which need an explicit
// 'toString()'
const join = (arr: any[], joiner?: string) =>
  arr.map((item: any) => item.toString()).join(joiner);

/**
 * Convert a target and a prop into a user-friendly string like store.tasks.1.done
 */
export const makeUserString = (propPath: PropPath) => join(propPath, '.');

export const makeInternalString = (propPath: PropPath) =>
  join(propPath, PROP_PATH_SEP);

/**
 * Takes the path stored in an object, and a new prop, and returns the two
 * combined
 */
export const extend = (target: Target, prop?: any): PropPath => {
  const basePath = target[PATH] || [];

  if (typeof prop === 'undefined') return basePath;

  return basePath.concat(prop);
};

/**
 * Convert a target and a prop into a user-friendly string like store.tasks.1.done
 */
export const extendToUserString = (target: Target, prop?: any): string =>
  makeUserString(extend(target, prop));

export const addProp = (target: Target, propPath: PropPath) => {
  if (!target) return;

  Object.defineProperty(target, PATH, {
    value: propPath,
    writable: true, // paths can be updated. E.g. store.tasks.2 could become store.tasks.1
  });
};

export const get = (target: Target) => target[PATH] || [];

export const has = (target: Target) => PATH in target;

export const set = (mutableTarget: Target, propPath: PropPath) => {
  mutableTarget[PATH] = propPath;
};
