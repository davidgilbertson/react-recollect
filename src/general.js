import { PATH_PROP } from './constants';
import { createProxy } from './proxy';
import * as utils from './utils';

/**
 * Convert a target and a prop into an internal path string like store~~~tasks~~~1~~~done
 * @param {object} target
 * @param {string} prop
 * @returns {Array<*>}
 */
export const makePath = (target, prop) => {
  // TODO (davidg): "extendPath"
  if (typeof prop !== 'undefined') {
    return [...target[PATH_PROP], prop];
  }
  return target[PATH_PROP];
};

/**
 * Convert the internal path string into something readable like store.tasks.1.done
 * @param {Array<*>} internalPath
 * @returns {string}
 */
export const makePathUserFriendly2 = internalPath => {
  // TODO (davidg): this would require a major version bump, but outputs the lodash-style string.
  //  This could then be used by the user if required? And just be more readable
  //  However it has to make the assumption that any number-only prop is array access
  // 'one~two~3~four'
  //   .split('~')
  //   .map(item => isNaN(Number(item)) ? `.${item}` : `[${item}]`)
  //   .join('')
  //   .replace(/^\./, '');
  // === one.two[3].four
  return internalPath.join('.');
};

/**
 * Convert a target and a prop into a user-friendly string like store.tasks.1.done
 * @param {object} target
 * @param {string} prop
 * @returns {string}
 */
export const makeUserFriendlyPath = (target, prop) => {
  const path = makePath(target, prop);
  return makePathUserFriendly2(path);
};

/**
 *
 * @param item
 * @param {Array<*>} propPath
 */
export const addPathProp = (item, propPath) => {
  Object.defineProperty(item, PATH_PROP, {
    value: propPath,
    writable: true, // paths can be updated. E.g. store.tasks.2 could become store.tasks.1
  });
};

/**
 *
 * @param {*} parentObject
 * @param parentPath
 * @return {*}
 */
export const decorateWithPathAndProxy = (parentObject, parentPath) => {
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
          return createProxy(decorateObject(itemEntry, [...path, i]));
        });

        addPathProp(nextArray, path);
        return createProxy(nextArray);
      }

      if (utils.isMap(item)) {
        addPathProp(item, path);
        return createProxy(item);
      }

      if (utils.isSet(item)) {
        addPathProp(item, path);
        return createProxy(item);
      }

      const newObject = {}; // TODO (davidg): reduce

      // TODO (davidg): is this necessary? Does the proxy not look after itself when calling set
      //  on children
      Object.entries(item).forEach(([prop, value]) => {
        newObject[prop] = createProxy(decorateObject(value, [...path, prop]));
      });

      addPathProp(newObject, path);

      return createProxy(newObject);
    }
    return item;
  };

  return decorateObject(parentObject, parentPath);
};
