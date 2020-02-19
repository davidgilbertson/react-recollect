import { PATH_PROP } from 'src/utils/constants';

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
