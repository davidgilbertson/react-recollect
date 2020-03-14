import {
  ArrWithSymbols,
  MapWithSymbols,
  ObjWithSymbols,
  PropPath,
  SetWithSymbols,
  Target,
} from './types';

export const isPlainObject = (item: any): item is ObjWithSymbols =>
  !!item && typeof item === 'object' && item.constructor === Object;

export const isArray = (item: any): item is ArrWithSymbols =>
  Array.isArray(item);

export const isMap = (item: any): item is MapWithSymbols => item instanceof Map;

export const isSet = (item: any): item is SetWithSymbols => item instanceof Set;

export const isProxyable = (item: any): item is Target =>
  isPlainObject(item) || isArray(item) || isMap(item) || isSet(item);

export const isSymbol = (item: any): item is symbol => typeof item === 'symbol';

export const isFunction = (item: any) => typeof item === 'function';

export const cloneArray = <T extends any[]>(item: T): T => item.slice() as T;

export const cloneMap = <T extends Map<any, any>>(item: T): T =>
  new Map(item) as T;

export const cloneSet = <T extends Set<any>>(item: T): T => new Set(item) as T;

type GetValue = {
  (item: ObjWithSymbols, prop: PropertyKey): any;
  (item: ArrWithSymbols, prop: number): any;
  (item: MapWithSymbols, prop: any): any;
  (item: SetWithSymbols, prop: any): any;
};

/**
 * Get the value from an object. This is for end-user objects. E.g. not
 * accessing a symbol property on a Map object.
 */
export const getValue: GetValue = (target: Target, prop: any) => {
  if (isMap(target)) return target.get(prop);
  if (isSet(target)) return prop;
  if (isArray(target)) return target[prop];

  return target[prop];
};

type SetValue = {
  (item: ObjWithSymbols, prop: PropertyKey, value: any): any;
  (item: ArrWithSymbols, prop: number, value: any): any;
  (item: MapWithSymbols, prop: any, value: any): any;
  (item: SetWithSymbols, prop: any, value: any): any;
};

export const setValue: SetValue = (
  mutableTarget: Target,
  prop: any,
  value: any
) => {
  if (isMap(mutableTarget)) {
    mutableTarget.set(prop, value);
  } else if (isSet(mutableTarget)) {
    mutableTarget.add(prop);
  } else if (isArray(mutableTarget)) {
    mutableTarget[prop] = value;
  } else if (isPlainObject(mutableTarget)) {
    // @ts-ignore - is fine, prop can be a symbol
    mutableTarget[prop] = value;
  } else {
    throw Error('Unexpected type');
  }
};

export const deepUpdate = <T extends Target>({
  mutableTarget,
  propPath,
  afterClone,
  updater,
}: {
  mutableTarget: T;
  propPath: PropPath;
  afterClone: <U extends Target>(original: U, clone: U) => U;
  updater: (object: Target) => void; // Target, but not necessarily T
}) => {
  const cloneItem = <V extends Target>(original: V): V => {
    let clone = original;

    if (isPlainObject(original)) clone = { ...original };
    if (isArray(original)) clone = cloneArray(original);
    if (isMap(original)) clone = cloneMap(original);
    if (isSet(original)) clone = cloneSet(original);

    // Let the caller do interesting things when cloning
    return afterClone(original, clone);
  };

  // Walk down into the object, mutating each node
  propPath.reduce((item, prop, i) => {
    const nextValue = cloneItem(getValue(item, prop));
    setValue(item, prop, nextValue);

    if (i === propPath.length - 1) {
      updater(nextValue);
    }

    return nextValue;
  }, mutableTarget);
};

/**
 * Replaces the contents of one object with the contents of another. The top
 * level object will remain the same, but all changed content will be replaced
 * with the new content.
 */
export const replaceObject = (
  mutableTarget: ObjWithSymbols,
  nextObject?: ObjWithSymbols
) => {
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
};
