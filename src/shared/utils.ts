import {
  ArrWithSymbols,
  MapWithSymbols,
  ObjWithSymbols,
  SetWithSymbols,
  Target,
} from './types';
import { ArrayMembers, PATH } from './constants';
import state from './state';

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

// This is internal to JS or to Recollect
export const isInternal = (prop: any): boolean =>
  prop === PATH ||
  prop === 'constructor' ||
  prop === 'toJSON' ||
  // Various type-checking libraries call these
  prop === '@@toStringTag' ||
  prop === Symbol.toStringTag;

export const isFunction = (item: any) => typeof item === 'function';

export const isArrayMutation = (target: Target, prop: any) =>
  isArray(target) &&
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

export const clone = <T extends Target>(target: T): T => {
  if (isObject(target)) return { ...target };
  // @ts-ignore
  if (isArray(target)) return target.slice();
  // @ts-ignore
  if (isMap(target)) return new Map(target);
  // @ts-ignore
  if (isSet(target)) return new Set(target);

  return target;
};

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
  (item: ObjWithSymbols, prop: PropertyKey, value: any): void;
  (item: ArrWithSymbols, prop: number, value: any): void;
  (item: MapWithSymbols, prop: any, value: any): void;
  /** For consistency, we'll just pass value twice for sets */
  (item: SetWithSymbols, prop: any, value: any): void;
};

export const setValue: SetValue = (
  mutableTarget: Target,
  prop: any,
  value: any
) => {
  if (isObject(mutableTarget)) {
    mutableTarget[prop] = value;
  } else if (isArray(mutableTarget)) {
    // @ts-ignore - is fine, prop can be a symbol
    mutableTarget[prop] = value;
  } else if (isMap(mutableTarget)) {
    // @ts-ignore
    mutableTarget.set(prop, value);
  } else if (isSet(mutableTarget)) {
    // @ts-ignore
    mutableTarget.add(value);
  } else {
    throw Error('Unexpected type');
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
 * Shallow replaces the contents of one object with the contents of another.
 * The top level object will remain the same, but all changed content will
 * be replaced with the new content.
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

/**
 * Traverse a tree, calling a callback for each node with the item and the path.
 * This can either mutate each value, or return a new value to create a clone.
 * @example const clone = utils.updateDeep(original, utils.clone);
 * Only traverses the targets supported by Recollect.
 */
export const updateDeep = <T extends Target>(
  mutableTarget: T,
  updater: <U extends Target>(item: U, path: any[]) => U | void
): T => {
  const path: any[] = [];

  const processLevel = (target: any) => {
    const updated = updater(target, path.slice());

    // If the updater returns something, use it. Else mutate the original.
    const next = typeof updated !== 'undefined' ? updated : target;

    const handleEntry = (prop: any, value: any) => {
      path.push(prop);
      const processed = processLevel(value);
      path.pop();

      setValue(next, prop, processed);
    };

    if (isObject(next)) {
      Object.entries(next).forEach(([prop, value]) => {
        handleEntry(prop, value);
      });
    } else if (isArray(next) || isMap(next)) {
      next.forEach((value: any, prop: any) => {
        handleEntry(prop, value);
      });
    } else if (isSet(next)) {
      // A set is special - you can't reassign what's in a particular
      // 'position' like the other three, so we do some fancy footwork...
      const setContents = Array.from(next);
      next.clear();

      setContents.forEach((value: any) => {
        handleEntry(value, value);
      });
    }

    return next;
  };

  return processLevel(mutableTarget);
};

/**
 * Does some work while the proxy is muted. Returns the result of the
 * callback as a convenience.
 * DO NOT expose this to users as it encourages non-deterministic behaviour.
 */
export const whileMuted = <T>(cb: () => T): T => {
  state.proxyIsMuted = true;
  const result = cb();
  state.proxyIsMuted = false;
  return result;
};

/**
 * This is a convenience method that triggers a read on each item in the array.
 * When used during the render cycle of a collected component, it has the
 * side-effect of subscribing that component to each item in the array.
 */
export const useProps = (props: any[]): void => {
  // useProps must never return, so it can be used in the body of a component
  props.includes(0);
};
