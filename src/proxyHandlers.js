import { isDebugOn } from './debug';
import {
  decorateWithPathAndProxy,
  makePath,
  makePathUserFriendly2,
  makeUserFriendlyPath,
} from './general';
import { isProxyMuted } from './proxy';
import { getCurrentComponent } from './collect';
import { addListener, notifyByPath } from './updating';
import { getFromNextStore, updateStoreAtPath } from './store';
import * as utils from './utils';

const shouldBypassProxy = prop => (
  isProxyMuted() ||
  !utils.isInBrowser() ||
  !getCurrentComponent() ||
  utils.isSymbol(prop) ||
  prop === 'constructor' ||
  prop === 'toJSON'
);

/**
 * Is this an attempt to get something from the store outside the render cycle?
 * This might be store.tasks.push() in a click event right after doing store.tasks = []
 * In this case, we should always return from nextStore.
 * @see setStoreTwiceInOnClick.test.js
 * @param {*} prop
 */
const isGettingPropOutsideOfRenderCycle = prop => (
  !getCurrentComponent() &&
  utils.isInBrowser() &&
  !utils.isSymbol(prop) &&
  prop !== 'constructor' && // TODO (davidg): maybe 'is exotic'? Check hasOwnProps? Slow?
  !isProxyMuted()
);

/**
 * This function takes an instruction to update the store. For simple properties, it will update
 * the store with target[prop] = value. It also takes an update function, allowing the caller
 * to update the store in a specific manner. E.g. target.clear(), where target is a Map.
 *
 * @param props
 * @param {*} props.target
 * @param {string} [props.prop]
 * @param {*} [props.value] - optional since updater can be passed. Note that it's legit to set
 * a value to 'undefined', so we mustn't infer anything from this value
 * @param {function} props.updater
 * @return {boolean}
 */
const handleSet = ({target, prop, value, updater}) => {
  // TODO (davidg): I should mute the proxy here already, right? Do this when I no longer
  //  call updateStoreAtPath() from two places below
  const currentValue = utils.getValue(target, prop);
  const newValuePath = makePath(target, prop);

  // Add paths to this new value
  const newValueProxy = decorateWithPathAndProxy(value, newValuePath);

  if (isDebugOn()) {
    console.groupCollapsed(`SET: ${makePathUserFriendly2(newValuePath)}`);
    console.info('From:', currentValue);
    console.info('To:  ', value); // The user doesn't care about the proxied version
    console.groupEnd();
  }

  const newStore = updateStoreAtPath({
    target,
    updater: (finalTarget) => {
      if (updater) {
        updater(finalTarget, newValueProxy);
      } else {
        debugger;
        finalTarget[prop] = newValueProxy;
      }
    },
  });

  notifyByPath({
    path: newValuePath,
    newStore,
  });

  return true;
};

export const mapOrSetProxyHandler = {
  // Map() and Set() get a special handler, because reads and writes all happen in the get() trap
  // Even though this is in get() - don't think of these like getting values,
  get(target, prop) {
    let result = Reflect.get(target, prop);

    // The innards of Map require this binding
    if (utils.isFunction(result)) result = result.bind(target);

    // bail early for some things. Unlike objects/arrays, we will continue on even
    // if !getCurrentComponent()
    if (
      isProxyMuted() ||
      !utils.isInBrowser() ||
      utils.isSymbol(prop) ||
      prop === 'constructor' ||
      prop === 'toJSON'
    ) {
      return result;
    }

    if (prop === 'clear' && !target.size) return result;

    // Note: this is slightly different to arrays. With an array, you call array.push(), but
    // that will then call array[i] = 'whatever' and hit the set() trap.
    // With Map/Set this doesn't happen; nothing ever hits the set() trap.

    // Adding to a Map
    if (prop === 'set') {
      // TODO is this slow? I'm wrapping the set result in a Proxy every time?
      //  Should I do this when first creating it?
      return new Proxy(result, {
        apply(func, target, [key, value]) {
          if (target.get(key) === value) return; // No change, no need to carry on

          return handleSet({
            target,
            prop: key,
            value,
            updater: (finalTarget, newProxiedValue) => {
              // We call the set now, but with the new args
              Reflect.apply(finalTarget[prop], finalTarget, [key, newProxiedValue]);
            }
          });
        }
      });
    }

    // Adding to a Set
    if (prop === 'add') {
      return new Proxy(result, {
        apply(func, target, [value]) {
          if (target.has(value)) return; // Would be a no op

          return handleSet({
            target,
            prop: value,
            value: value,
            updater: (finalTarget, newProxiedValue) => {
              Reflect.apply(finalTarget[prop], finalTarget, [newProxiedValue]);
            }
          });
        }
      });
    }

    // On either a Set or Map
    if (prop === 'clear' || prop === 'delete') {
      return new Proxy(result, {
        apply(func, target, [key]) {
          if (prop === 'delete' && !target.has(key)) return result; // Would not be a change

          return handleSet({
            target,
            prop,
            updater: (finalTarget) => {
              Reflect.apply(finalTarget[prop], finalTarget, [key]);
            }
          });
        }
      });
    }

    // Now that we've ruled out set/clear/delete, we can bail if we're not in the render cycle
    if (!getCurrentComponent()) return result;

    // For `size` or any getter method, subscribe to size changes and return
    if (['size', 'get', 'entries', 'forEach', 'has', 'keys', 'values'].includes(prop)) {
      addListener(target, 'size');
      // TODO (davidg): do I not log the get on some Map or Set reads?
      return result;
    }

    // TODO (davidg): does 'size' need to be below this? Would I be getting the wrong size?
    if (isGettingPropOutsideOfRenderCycle(prop)) {
      console.log('> getting from outside render cycle:', prop);
      return getFromNextStore(target, prop);
    }

    return result;
  },
};

let isInBulkOperation = false;

export const objectOrArrayProxyHandler = {
  get(target, prop) {
    let result = Reflect.get(target, prop);
    if (isInBulkOperation) return result;

    // TODO (davidg): array.pop() when empty can bail. But that's not easy
    if (
      Array.isArray(target) &&
      typeof target[prop] === 'function' &&
      ['sort', 'reverse', 'shift', 'splice', 'unshift', 'copyWithin'].includes(prop)
    ) {
      // These methods can rearrange an array over multiple steps. We don't want to trigger
      // any renders during this operation, so we set isInBulkOperation
      return new Proxy(result, {
        apply(target, prop, args) {
          isInBulkOperation = true;
          const result = Reflect.apply(target, prop, args);
          isInBulkOperation = false;
          return result;
        }
      })
    }

    if (utils.isFunction(target[prop])) return result;

    if (!isInBulkOperation && isGettingPropOutsideOfRenderCycle(prop)) {
      return getFromNextStore(target, prop);
    }

    if (shouldBypassProxy(prop)) return result;

    if (isDebugOn()) {
      console.groupCollapsed(`GET: ${makeUserFriendlyPath(target, prop)}`);
      console.info(`Component: <${getCurrentComponent()._name}>`);
      console.info('Value:', result);
      console.groupEnd();
    }

    addListener(target, prop);

    return result;
  },

  has(target, prop) {
    if (
      isProxyMuted() ||
      !utils.isInBrowser() ||
      utils.isArray(target) // Arrays call this trap, but we don't care
    ) {
      return Reflect.has(target, prop);
    }

    if (isDebugOn()) {
      console.groupCollapsed(`GET: ${makeUserFriendlyPath(target, prop)}`);
      console.info(`Component: <${getCurrentComponent()._name}>`);
      console.groupEnd();
    }

    addListener(target, prop);

    return Reflect.has(target, prop);
  },

  set(target, prop, value) {
    // We need to let the 'length' change through, even if it doesn't change, so it can
    // trigger listeners and update components.
    // This could happen e.g. when sort() changes individual items in an array. It will fire
    // a set() on 'length' (helpful!) which tells us we need to update.
    if (prop !== 'length' && target[prop] === value) return true;

    if (isProxyMuted() || !utils.isInBrowser()) return Reflect.set(target, prop, value);

    return handleSet({
      target,
      prop,
      value,
      updater: (finalTarget, newValueProxy) => {
        Reflect.set(finalTarget, prop, newValueProxy);
      },
    });
  },

  deleteProperty(target, prop) {
    // TODO (davidg): use shouldBypassProxy? Or not for delete?
    if (isProxyMuted() || !utils.isInBrowser()) return Reflect.deleteProperty(target, prop);

    if (isDebugOn()) {
      console.groupCollapsed(`DELETE: ${makeUserFriendlyPath(target, prop)}`);
      console.info('Property: ', makeUserFriendlyPath(target, prop));
      console.groupEnd();
    }

    // TODO (davidg): this duplicates handleSet() a bit. Better to generalise that function
    const path = makePath(target, prop);

    const newStore = updateStoreAtPath({
      target,
      updater: finalTarget => {
        // Could I not just pass `args` and `reflection`?
        Reflect.deleteProperty(finalTarget, prop);
      },
    });

    notifyByPath({
      path,
      newStore,
    });

    return true;
  }
};