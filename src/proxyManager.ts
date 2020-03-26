import * as pubSub from './shared/pubSub';
import { logDelete, logGet, logSet } from './shared/debug';
import state from './shared/state';
import * as utils from './shared/utils';
import * as paths from './shared/paths';
import { ArrayMembers, MapOrSetMembers, ORIGINAL } from './shared/constants';
import { PropPath, Target } from './shared/types';

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
        if (state.proxyIsMuted || utils.isInternal(prop)) {
          return result;
        }

        const nextVersion = state.nextVersionMap.get(target);
        if (nextVersion) return Reflect.get(nextVersion, prop);

        // Adding to a Map
        if (prop === MapOrSetMembers.Set) {
          const handler: ProxyHandler<() => any> = {
            apply(func, applyTarget, [key, value]) {
              if (applyTarget.get(key) === value) return true; // No change, no need to carry on

              return pubSub.dispatchUpdateInNextStore({
                target: applyTarget,
                prop: key,
                value,
                updater: (finalTarget, newProxiedValue) => {
                  logSet(target, prop, newProxiedValue);

                  // We call the map.set() now, but on the item in the
                  // store, and with the new args
                  return Reflect.apply(finalTarget[prop], finalTarget, [
                    key,
                    newProxiedValue,
                  ]);
                },
              });
            },
          };

          return new Proxy(result, handler);
        }

        // Adding to a Set
        if (prop === MapOrSetMembers.Add) {
          const handler: ProxyHandler<() => any> = {
            apply(func, applyTarget, [value]) {
              if (applyTarget.has(value)) return true; // Would be a no op

              return pubSub.dispatchUpdateInNextStore({
                target: applyTarget,
                notifyTarget: true,
                value,
                updater: (finalTarget, newProxiedValue) => {
                  logSet(target, prop, newProxiedValue);

                  return Reflect.apply(finalTarget[prop], finalTarget, [
                    newProxiedValue,
                  ]);
                },
              });
            },
          };

          return new Proxy(result, handler);
        }

        // On either a Set or Map
        if (prop === MapOrSetMembers.Clear || prop === MapOrSetMembers.Delete) {
          const handler: ProxyHandler<() => any> = {
            apply(func, applyTarget, [key]) {
              if (
                !applyTarget.size ||
                (prop === MapOrSetMembers.Delete && !applyTarget.has(key))
              ) {
                return false; // false indicates no change
              }

              return pubSub.dispatchUpdateInNextStore({
                target: applyTarget,
                notifyTarget: true,
                updater: (finalTarget) => {
                  logSet(target, prop);

                  return Reflect.apply(finalTarget[prop], finalTarget, [key]);
                },
              });
            },
          };

          return new Proxy(result, handler);
        }

        // Now that we've handled any modifying methods, we can
        // just return the result if we're not in the render cycle.
        if (!state.currentComponent) return result;

        // If we're reading a particular value, we'll want a listener for that
        // We don't listen on `.has` because any change that would result in
        // `.has` returning a different value would update the target
        if (utils.isMap(target) && prop === MapOrSetMembers.Get) {
          const handler: ProxyHandler<() => any> = {
            apply(func, applyTarget, args) {
              addListener(paths.extend(target, args[0]));
              return Reflect.apply(func, applyTarget, args);
            },
          };

          return new Proxy(result, handler);
        }

        // For all other read operations, just return
        return result;
      },
    };
  }

  return {
    get(target, prop) {
      // This allows getting the un-proxied version of a proxied object
      if (prop === ORIGINAL) return target;

      const result = Reflect.get(target, prop);

      if (state.proxyIsMuted || utils.isInternal(prop)) return result;

      // Mutating array methods make a lot of noise, so we wrap them in a proxy
      // Only one update will be fired - for the actual array.
      if (utils.isArrayMutation(target, prop)) {
        const handler: ProxyHandler<() => {}> = {
          apply(func, applyTarget, args) {
            return pubSub.dispatchUpdateInNextStore({
              target: applyTarget,
              notifyTarget: true,
              value: args,
              updater: (finalTarget, proxiedArgs) => {
                logSet(target, prop, proxiedArgs);

                const updateResult = Reflect.apply(
                  // @ts-ignore - Yes, symbol CAN be used as an index type
                  finalTarget[prop],
                  finalTarget,
                  proxiedArgs
                );

                const rootPath = paths.get(target);

                // At this point, the array is updated. But the paths of the
                // items could be wrong, so we refresh them.
                utils.updateDeep(finalTarget, (item, path) => {
                  if (utils.isTarget(item)) {
                    paths.addProp(item, [...rootPath, ...path]);
                  }
                });

                return updateResult;
              },
            });
          },
        };

        return new Proxy(result, handler);
      }

      // For all other methods (.join, .toString(), etc) return the function
      // @ts-ignore - wrong, symbol can be used an an index type
      if (utils.isFunction(target[prop])) return result;

      // When we're outside the render cycle, we route
      // requests to the 'next version'
      // Note, this will result in another get(), but on the equivalent
      // target from the next store. muteProxy will be set so this line
      // isn't triggered in an infinite loop
      if (!state.currentComponent) {
        const nextVersion = state.nextVersionMap.get(target);
        if (nextVersion) return Reflect.get(nextVersion, prop);
      }

      // We record a get if a component is rendering, with the exception
      // of reading array length. This would be redundant, since changes to
      // length trigger a change on the array itself
      if (
        state.currentComponent &&
        !(utils.isArray(target) && prop === ArrayMembers.Length)
      ) {
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

      if (process.env.NODE_ENV !== 'production') {
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
      }

      // If there's no change, we return
      // @ts-ignore - target[prop] is fine
      if (target[prop] === value) return true;

      return pubSub.dispatchUpdateInNextStore({
        target,
        prop,
        value,
        updater: (finalTarget, newValueProxy) => {
          logSet(target, prop, newValueProxy);

          return Reflect.set(finalTarget, prop, newValueProxy);
        },
      });
    },

    deleteProperty(target, prop) {
      if (state.proxyIsMuted) return Reflect.deleteProperty(target, prop);

      return pubSub.dispatchUpdateInNextStore({
        target,
        prop,
        notifyTarget: true,
        updater: (finalTarget) => {
          logDelete(target, prop);

          return Reflect.deleteProperty(finalTarget, prop);
        },
      });
    },
  };
};

/**
 * Wrap an item in a proxy
 */
export const createShallow = <T extends any>(target: T): T => {
  if (process.env.NODE_ENV !== 'production') {
    if (!target) throw Error('There is no target');
  }

  return new Proxy(target as Target, getHandlerForObject(target)) as T;
};
