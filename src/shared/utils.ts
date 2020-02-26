import { IS_OLD_STORE } from 'src/shared/constants';

export const isMap = (item) => item instanceof Map;
export const isSet = (item) => item instanceof Set;
export const isMapOrSet = (item) => isMap(item) || isSet(item);
export const isSymbol = (item) => typeof item === 'symbol';
export const isFunction = (item) => typeof item === 'function';
export const isPlainObject = (item) =>
  item && typeof item === 'object' && item.constructor === Object;
export const isArray = (item) => Array.isArray(item);

export const cloneMap = (originalMap) => new Map(originalMap);
export const cloneSet = (originalSet) => new Set(originalSet);

export const getValue = (target, prop) => {
  if (isMap(target)) return target.get(prop);
  if (isSet(target)) return prop;

  return target[prop];
};

export const setValue = (mutableTarget, prop, value) => {
  if (isMap(mutableTarget)) mutableTarget.set(prop, value);
  if (isSet(mutableTarget)) mutableTarget.add(prop);

  mutableTarget[prop] = value;
};

// TODO (davidg): how does this fair with optional?.chaining?
type DeepUpdateProps = {
  object: object;
  path: any[];
  onClone?: (original: object, clone: object) => void;
  updater: (object: object) => void;
};

export const deepUpdate = ({
  object,
  path,
  onClone,
  updater,
}: DeepUpdateProps) => {
  const cloneItem = (original) => {
    let clone = original;

    if (isArray(original)) clone = original.slice();
    if (isMap(original)) clone = cloneMap(original);
    if (isSet(original)) clone = cloneSet(original);
    if (isPlainObject(original)) clone = { ...original };

    // Let the caller do interesting things when cloning
    return onClone ? onClone(original, clone) : clone;
  };

  const result = cloneItem(object);

  // This will be the case if we're updating the top-level store
  if (!path.length) {
    updater(result);
  } else {
    path.reduce((item, prop, i) => {
      const nextValue = cloneItem(getValue(item, prop));
      setValue(item, prop, nextValue);

      if (i === path.length - 1) {
        updater(nextValue);
        return null; // doesn't matter
      }

      return nextValue;
    }, result);
  }

  return result;
};

/**
 * Replaces the contents of one object with the contents of another. The top
 * level object will remain the same, but all changed content will be replaced
 * with the new content.
 *
 * @param {object} mutableTarget - the object to update/replace
 * @param {object} nextObject - the object to replace it with
 */
export const replaceObject = (mutableTarget, nextObject) => {
  if (nextObject) {
    // From the new data, add to the old data anything that's new
    // (from the top level props only)
    Object.entries(nextObject).forEach(([prop, value]) => {
      if (mutableTarget[prop] !== value) {
        mutableTarget[prop] = value;
      }
    });

    // Clear out any keys that aren't in the new data
    Object.keys(mutableTarget).forEach((prop) => {
      if (!(prop in nextObject)) {
        delete mutableTarget[prop];
      }
    });
  } else {
    // Just empty the old object
    Object.keys(mutableTarget).forEach((prop) => {
      delete mutableTarget[prop];
    });
  }

  // If the user is reading this object while a component is rendering,
  // they're doing it wrong.
  mutableTarget[IS_OLD_STORE] = true;
};
