import {
  ArrWithSymbols,
  MapWithSymbols,
  ObjWithSymbols,
  PropPath,
  SetWithSymbols,
  Target,
} from './types';
import { ArrayMembers, PATH } from './constants';

// 'object' meaning 'plain object'.
export const isObject = (item: any): item is ObjWithSymbols =>
  !!item && typeof item === 'object' && item.constructor === Object;

export const isArray = (item: any): item is ArrWithSymbols =>
  Array.isArray(item);

export const isMap = (item: any): item is MapWithSymbols => item instanceof Map;

export const isSet = (item: any): item is SetWithSymbols => item instanceof Set;

// A target is one of the four types that Recollect will proxy
export const isTarget = (item: any): item is Target =>
  isObject(item) || isArray(item) || isMap(item) || isSet(item);

export const isSymbol = (item: any): item is symbol => typeof item === 'symbol';

// This is internal to JS or to Recollect
export const isInternal = (item: any): boolean =>
  [PATH, 'constructor'].includes(item);

export const isFunction = (item: any) => typeof item === 'function';

const isArrayMutatorMethod = (prop: any) =>
  [
    ArrayMembers.CopyWithin,
    ArrayMembers.Fill,
    ArrayMembers.Pop,
    ArrayMembers.Push,
    ArrayMembers.Reverse,
    ArrayMembers.Shift,
    ArrayMembers.Sort,
    ArrayMembers.Splice,
    ArrayMembers.Unshift,
  ].includes(prop);

export const isArrayMutation = (target: Target, prop: any) =>
  isArray(target) && isArrayMutatorMethod(prop);

export const cloneObject = <T extends object>(item: T): T => ({ ...item } as T);

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
  } else if (isObject(mutableTarget)) {
    // @ts-ignore - is fine, prop can be a symbol
    mutableTarget[prop] = value;
  } else {
    throw Error('Unexpected type');
  }
};

/**
 * Mutates an object at a specific path. Each object on the path down to
 * the target object is cloned.
 */
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

    if (isObject(original)) clone = cloneObject(original);
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

export const getSize = (item: Target): number => {
  if (isObject(item)) return Object.keys(item).length;
  // @ts-ignore - TS thinks item is never
  if (isArray(item)) return item.length;
  // @ts-ignore - TS thinks item is never
  if (isMap(item) || isSet(item)) return item.size;

  throw Error('Unexpected type');
};

/**
 * Traverse a tree, calling a callback for each node with the item and the path
 * Only traverses the targets supported by Recollect
 */
export const updateDeep = (
  mutableTarget: object,
  updater: (item: any, path: any[]) => any
) => {
  const path: any[] = [];

  const processLevel = (target: any) => {
    updater(target, path.slice());

    if (isObject(target)) {
      Object.entries(target).forEach(([prop, value]) => {
        path.push(prop);
        processLevel(value);
        path.pop();
      });
    } else if (isArray(target)) {
      target.forEach((item: any, i: number) => {
        path.push(i);
        processLevel(item);
        path.pop();
      });
    } else if (isMap(target) || isSet(target)) {
      target.forEach((value: any, key: any) => {
        path.push(key);
        processLevel(value);
        path.pop();
      });
    }
  };

  processLevel(mutableTarget);
};
