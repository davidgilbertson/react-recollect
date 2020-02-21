export const isMap = item => item instanceof Map;
export const isSet = item => item instanceof Set;
export const isMapOrSet = item => isMap(item) || isSet(item);
export const isSymbol = item => typeof item === 'symbol';
export const isFunction = item => typeof item === 'function';
export const isPlainObject = item =>
  item && typeof item === 'object' && item.constructor === Object;
export const isArray = item => Array.isArray(item);

export const cloneMap = originalMap => new Map(originalMap);
export const cloneSet = originalSet => new Set(originalSet);

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
export const deepUpdate = ({ object, path, onClone, updater }) => {
  const cloneItem = original => {
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
