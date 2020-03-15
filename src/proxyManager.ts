import * as pubSub from './shared/pubSub';
import { logDelete, logGet, logSet } from './shared/debug';
import state from './shared/state';
import * as utils from './shared/utils';
import { isProxyable } from './shared/utils';
import * as paths from './shared/paths';
import { ORIGINAL } from './shared/constants';
import { PropPath, Target } from './shared/types';

const enum MapOrSetMembers {
  Add = 'add',
  Clear = 'clear',
  Delete = 'delete',
  Entries = 'entries',
  ForEach = 'forEach',
  Get = 'get',
  Has = 'has',
  Keys = 'keys',
  Set = 'set',
  Size = 'size',
  Values = 'values',
}

/**
 * Add a new listener to be notified when a particular value in the store changes
 * To be used when a component reads from a property.
 */
const addListener = (propPath: PropPath) => {
  if (!state.currentComponent) return;

  // We use a string instead of an array because it's much easier to match
  const pathString = paths.makeInternalString(propPath);

  const components = state.listeners.get(pathString) || new Set();
  components.add(state.currentComponent);
  state.listeners.set(pathString, components);
};

/**
 * These are the proxy handlers. Notes:
 * * We have different handlers (different traps) for object/array and
 *    map/set.
 * * When the proxy is muted, use Reflect[trap] and bypass any logic. The
 *    exception is Map/Set methods, where we must bind `this` first
 * * `ORIGINAL` lets us unwrap a proxied object
 * * We redirect to the 'next version' of a target if it has been changed
 */
export const getHandlerForObject = <T extends Target>(
  targetObject: T
): ProxyHandler<T> => {
  if (utils.isMap(targetObject) || utils.isSet(targetObject)) {
    // Map() and Set() get a special handler, because reads and writes all
    // happen in the get() trap (different to the get() method of the map/set!)
    return {
      get(target, prop) {
        if (prop === ORIGINAL) return target;
        let result = Reflect.get(target, prop);

        // The innards of Map and Set require this binding
        if (utils.isFunction(result)) result = result.bind(target);

        // Bail early for some things. Unlike objects/arrays, we will
        // continue on even if !state.currentComponent
        if (
          state.proxyIsMuted ||
          utils.isSymbol(prop) ||
          prop === 'constructor' ||
          prop === 'toJSON'
        ) {
          return result;
        }

        const nextVersion = state.nextVersionMap.get(target);
        if (nextVersion) return Reflect.get(nextVersion, prop);

        // @ts-ignore - `.size` DOES exist, this is a Map or Set
        if (prop === MapOrSetMembers.Clear && !target.size) return result;

        // Note: this is slightly different to arrays. With an array, you call array.push(), but
        // that will then call array[i] = 'whatever' and hit the set() trap.
        // With Map/Set this doesn't happen; nothing ever hits the set() trap.

        // Adding to a Map
        if (prop === MapOrSetMembers.Set) {
          // TODO is this slow? I'm wrapping the set result in a Proxy every time?
          //  Should I do this when first creating it?
          const handler: ProxyHandler<T> = {
            apply(func, applyTarget, [key, value]) {
              if (applyTarget.get(key) === value) return true; // No change, no need to carry on

              pubSub.dispatchUpdateInNextStore({
                target: applyTarget,
                prop: key,
                value,
                updater: (finalTarget, newProxiedValue) => {
                  logSet(target, prop, newProxiedValue);

                  // We call the map.set() now, but on the item in the
                  // store, and with the new args
                  Reflect.apply(finalTarget[prop], finalTarget, [
                    key,
                    newProxiedValue,
                  ]);
                },
              });

              return true;
            },
          };

          return new Proxy(result, handler);
        }

        // Adding to a Set
        if (prop === MapOrSetMembers.Add) {
          const handler: ProxyHandler<T> = {
            apply(func, applyTarget, [value]) {
              if (applyTarget.has(value)) return true; // Would be a no op

              pubSub.dispatchUpdateInNextStore({
                target: applyTarget,
                prop: value,
                value,
                updater: (finalTarget, newProxiedValue) => {
                  logSet(target, prop, newProxiedValue);

                  Reflect.apply(finalTarget[prop], finalTarget, [
                    newProxiedValue,
                  ]);
                },
              });

              return true;
            },
          };

          return new Proxy(result, handler);
        }

        // On either a Set or Map
        if (prop === MapOrSetMembers.Clear || prop === MapOrSetMembers.Delete) {
          const handler: ProxyHandler<T> = {
            apply(func, applyTarget, [key]) {
              if (prop === 'delete' && !applyTarget.has(key)) return result; // Would not be a change

              pubSub.dispatchUpdateInNextStore({
                target: applyTarget,
                prop,
                updater: (finalTarget) => {
                  logSet(target, prop);

                  Reflect.apply(finalTarget[prop], finalTarget, [key]);
                },
              });

              return true;
            },
          };

          return new Proxy(result, handler);
        }

        // Now that we've handled any modifying methods, we can
        // just return the result if we're not in the render cycle.
        if (!state.currentComponent) return result;

        // Otherwise, we're in the render cycle, so we carry on to potentially
        // get the value from the next store

        // For `size` or any getter method, subscribe to size changes and return
        if (
          [
            MapOrSetMembers.Entries,
            MapOrSetMembers.ForEach,
            MapOrSetMembers.Get,
            MapOrSetMembers.Has,
            MapOrSetMembers.Keys,
            MapOrSetMembers.Size,
            MapOrSetMembers.Values,
            // @ts-ignore - it doesn't matter that prop might be a number
          ].includes(prop)
        ) {
          addListener(paths.extend(target, MapOrSetMembers.Size));
          // TODO (davidg): do I not log the get on some Map or Set reads?
          return result;
        }

        return result;
      },
    };
  }

  return {
    get(target, prop) {
      // This allows getting the un-proxied version of a proxied object
      if (prop === ORIGINAL) return target;

      if (state.proxyIsMuted) return Reflect.get(target, prop);

      const result = Reflect.get(target, prop);

      // @ts-ignore - wrong, symbol can be used an an index type
      if (utils.isFunction(target[prop])) return result;

      // When we're outside the render cycle, we route requests to the same
      // object in `store`.
      // Note, this will result in another get(), but on the equivalent
      // target from the next store. muteProxy will be set so this line
      // isn't triggered in an infinite loop
      if (
        !state.currentComponent &&
        !utils.isSymbol(prop) &&
        prop !== 'constructor'
      ) {
        const nextVersion = state.nextVersionMap.get(target);
        if (nextVersion) return Reflect.get(nextVersion, prop);
      }

      if (state.currentComponent) {
        logGet(target, prop, result);

        addListener(paths.extend(target, prop));
      }

      return result;
    },

    has(target, prop) {
      if (state.proxyIsMuted) return Reflect.has(target, prop);
      // Arrays use `has` too, but we capture a listener elsewhere for that.
      // Here we only want to capture access to objects
      if (state.currentComponent && !utils.isArray(target)) {
        logGet(target, prop);

        addListener(paths.extend(target, prop));
      }

      const nextVersion = state.nextVersionMap.get(target);
      if (nextVersion) return Reflect.has(nextVersion, prop);

      return Reflect.has(target, prop);
    },

    ownKeys(target) {
      if (state.proxyIsMuted) return Reflect.ownKeys(target);

      const nextVersion = state.nextVersionMap.get(target);
      if (nextVersion) return Reflect.ownKeys(nextVersion);

      if (state.currentComponent) {
        logGet(target);

        addListener(paths.get(target));
      }

      return Reflect.ownKeys(target);
    },

    set(target, prop, value) {
      if (state.proxyIsMuted) return Reflect.set(target, prop, value);

      if (state.currentComponent) {
        console.error(
          [
            `You are attempting to modify the store during a render cycle. `,
            `(You're setting "${prop.toString()}" to "${value}" somewhere)\n`,
            `This could result in subtle bugs. `,
            `If you're changing the store in componentDidMount, wrap your `,
            `code in a setTimeout() to allow the render cycle to complete `,
            `before changing the store.`,
          ].join('')
        );
      }

      // We need to let the 'length' change through, even if it doesn't change, so it can
      // trigger listeners and update components.
      // This could happen e.g. when sort() changes individual items in an array. It will fire
      // a set() on 'length' (helpful!) which tells us we need to update.

      // @ts-ignore - target[prop] is fine
      if (prop !== 'length' && target[prop] === value) return true;

      pubSub.dispatchUpdateInNextStore({
        target,
        prop,
        value,
        updater: (finalTarget, newValueProxy) => {
          logSet(target, prop, newValueProxy);

          Reflect.set(finalTarget, prop, newValueProxy);
        },
      });

      return true;
    },

    deleteProperty(target, prop) {
      if (state.proxyIsMuted) return Reflect.deleteProperty(target, prop);

      pubSub.dispatchUpdateInNextStore({
        target,
        prop,
        updater: (finalTarget) => {
          logDelete(target, prop);

          Reflect.deleteProperty(finalTarget, prop);
        },
      });

      return true;
    },
  };
};

/**
 * Wrap an item in a proxy
 */
export const createShallow = <T extends any>(target: T): T => {
  if (!target || !utils.isProxyable(target)) return target;

  const handler = getHandlerForObject(target);

  return new Proxy(target as Target, handler) as T;
};

/**
 * Wrap an item, and all proxiable children, in proxies
 */
export const createDeep = <T extends Target>(
  rootTarget: T,
  rootTargetPropPath: PropPath
): T => {
  const proxyThisLevel = <U extends any>(target: U, propPath: PropPath): U => {
    if (!isProxyable(target)) return target;

    let next = target;

    if (utils.isPlainObject(target)) {
      next = {} as U; // U is ObjWithSymbols

      Object.entries(target).forEach(([prop, value]) => {
        next[prop] = proxyThisLevel(value, [...propPath, prop]);
      });
    }

    if (utils.isArray(target)) {
      next = target.map((item: any, i: number) => {
        return proxyThisLevel(item, [...propPath, i]);
      }) as U; // U is ArrWithSymbols
    }

    if (utils.isMap(target)) {
      // @ts-ignore - U is MapWithSymbols
      next = new Map() as U;

      target.forEach((value: any, key: any) => {
        next.set(key, proxyThisLevel(value, [...propPath, key]));
      });
    }

    if (utils.isSet(target)) {
      // @ts-ignore - U is SetWithSymbols
      next = new Set() as U;

      target.forEach((value: any, i: number) => {
        next.add(proxyThisLevel(value, [...propPath, i]));
      });
    }

    if (propPath.length) paths.addProp(next, propPath);

    return createShallow(next);
  };

  return proxyThisLevel(rootTarget, rootTargetPropPath);
};
