export const isInBrowser = () => typeof window !== 'undefined';
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

const clone = item => {
  if (isArray(item)) return item.slice();
  if (isMap(item)) return cloneMap(item);
  if (isSet(item)) return cloneSet(item);
  if (isPlainObject(item)) return { ...item };
  return item;
};

// TODO (davidg): how does this fair with optional?.chaining?
// TODO (davidg): this isn't implemented yet.
export const deepUpdate = ({ object, path, updater }) => {
  const result = clone(object);

  path.reduce((item, prop, i) => {
    const nextValue = clone(getValue(item, prop));
    setValue(item, prop, nextValue);

    if (i === path.length - 1) {
      updater(nextValue);
      return null; // doesn't matter
    }

    return nextValue;
  }, result);

  return result;
};
