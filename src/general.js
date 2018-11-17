import { PATH_PROP, PROP_PATH_SEP } from './constants';
import { createProxy } from './proxy';

export const isObject = item => item && typeof item === 'object' && item.constructor === Object;

export const isArray = item => Array.isArray(item);

/**
 * Convert a target and a prop into an internal path string like store~~~tasks~~~1~~~done
 * @param {object} target
 * @param {string} prop
 * @returns {string}
 */
export const makePath = (target, prop) => {
  if (prop) {
    return [target[PATH_PROP], prop].join(PROP_PATH_SEP);
  }
  return target[PATH_PROP];
};

/**
 * Convert the internal path string into something readable like store.tasks.1.done
 * @param {string} internalPath
 * @returns {string}
 */
export const makePathUserFriendly = internalPath => {
  const replacer = new RegExp(PROP_PATH_SEP, 'g');
  return internalPath.replace(replacer, '.');
};

/**
 * Convert a target and a prop into a user-friendly string like store.tasks.1.done
 * @param {object} target
 * @param {string} prop
 * @returns {string}
 */
export const makeUserFriendlyPath = (target, prop) => {
  const path = makePath(target, prop);
  return makePathUserFriendly(path);
};

export const addPathProp = (item, value) => {
  Object.defineProperty(item, PATH_PROP, {
    value,
    writable: true, // paths can be updated. E.g. store.tasks.2 could become store.tasks.1
  });
};

export const decorateWithPathAndProxy = (parentObject, parentPath) => {
  const decorateObject = (item, path) => {
    if (isArray(item) || isObject(item)) {

      if (isArray(item)) {
        const nextArray = item.map((itemEntry, i) => {
          return createProxy(decorateObject(itemEntry, `${path}${PROP_PATH_SEP}${i}`));
        });

        addPathProp(nextArray, path);
        return createProxy(nextArray);
      }

      const newObject = {}; // TODO (davidg): reduce

      Object.entries(item).forEach(([prop, value]) => {
        newObject[prop] = createProxy(decorateObject(value, `${path}${PROP_PATH_SEP}${prop}`));
      });

      addPathProp(newObject, path);

      return createProxy(newObject);
    } else {
      return item;
    }
  };

  return decorateObject(parentObject, parentPath);
};
