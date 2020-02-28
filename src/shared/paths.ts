import { PROP_PATH_SEP } from './constants';

const PATH_PROP = Symbol('path');

/**
 * Convert a target and a prop into a user-friendly string like store.tasks.1.done
 * @param {Array<*>} pathArray
 * @returns {string}
 */
export const makeUserString = (pathArray) => pathArray.join('.');

/**
 * @param {Array<*>} pathArray
 * @returns {string}
 */
export const makeInternalString = (pathArray) => pathArray.join(PROP_PATH_SEP);

/**
 * Takes the path stored in an object, and a new prop, and returns the two
 * combined
 * @param {object} obj
 * @param {string} [prop]
 * @returns {Array<*>}
 */
export const extend = (obj, prop) => {
  const basePath = obj[PATH_PROP] || [];

  if (typeof prop === 'undefined') return basePath;

  return basePath.concat(prop);
};

/**
 * Convert a obj and a prop into a user-friendly string like store.tasks.1.done
 */
export const extendToUserString = (obj: object, prop?: string) =>
  makeUserString(extend(obj, prop));

/**
 *
 * @param item
 * @param {Array<*>} propPath
 */
export const addProp = (item, propPath) => {
  Object.defineProperty(item, PATH_PROP, {
    value: propPath,
    writable: true, // paths can be updated. E.g. store.tasks.2 could become store.tasks.1
  });
};

export const get = (obj) => obj[PATH_PROP] || [];
export const has = (obj) => PATH_PROP in obj;
export const set = (mutableTarget, propArray) => {
  mutableTarget[PATH_PROP] = propArray;
};
