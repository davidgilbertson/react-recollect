import { getFromNextStore, updateStoreAtPath } from 'src/store';

import { debug } from 'src/shared/debug';
import state from 'src/shared/state';
import {
  makePath,
  makePathUserFriendly2,
  makeUserFriendlyPath,
} from 'src/shared/general';
import * as utils from 'src/shared/utils';
import { PROP_PATH_SEP } from 'src/shared/constants';

/**
 * Add a new listener to be notified when a particular value in the store changes
 * To be used when a component reads from a property
 * @param {Array<*>} pathArray
 */
const addListener = pathArray => {
  if (!state.currentComponent) return;

  // We use a string instead of an array because it's much easier to match
  const pathString = pathArray.slice(1).join(PROP_PATH_SEP);

  // TODO (davidg): consider Map instead of array? Easier to delete a component?
  //  could be like this, but as a Map
  // const listeners = {
  //   'path~~~as~~~string': {
  //     pathArray: ['path', 'as', 'string'],
  //     components: [],
  //   }
  // }

  if (state.listeners[pathString]) {
    state.listeners[pathString].push(state.currentComponent);
  } else {
    state.listeners[pathString] = [state.currentComponent];
  }
};

/**
 * We bypass the proxy if we don't want to:
 * a) record a GET of a prop and add a listener for that prop path
 * b) emit a SET and trigger listeners (which re-render components)
 * @param prop
 * @return {boolean}
 */
// TODO (davidg): there's only one use of this now, move it back down
const shouldBypassProxy = prop =>
  state.proxyIsMuted ||
  !utils.isInBrowser() ||
  !state.currentComponent ||
  utils.isSymbol(prop) ||
  prop === 'constructor' ||
  prop === 'toJSON';

/**
 * Is this an attempt to get something from the store outside the render cycle?
 * This might be store.tasks.push() in a click event right after doing store.tasks = []
 * In this case, we should always return from nextStore.
 * @see setStoreTwiceInOnClick.test.js
 * @param {*} prop
 */
const isGettingPropOutsideOfRenderCycle = prop =>
  !state.currentComponent &&
  utils.isInBrowser() &&
  !utils.isSymbol(prop) &&
  prop !== 'constructor' && // TODO (davidg): maybe 'is exotic'? Check hasOwnProps? Slow?
  !state.proxyIsMuted;

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
const handleSet = ({ target, prop, value, updater }) => {
  // TODO (davidg): I should mute the proxy here already, right? Do this when I no longer
  //  call updateStoreAtPath() from two places below
  const currentValue = utils.getValue(target, prop);
  const path = makePath(target, prop);

  debug(() => {
    console.groupCollapsed(`SET: ${makePathUserFriendly2(path)}`);
    console.info('From:', currentValue);
    console.info('To:  ', value); // The user doesn't care about the proxied version
    console.groupEnd();
  });

  updateStoreAtPath({
    target,
    value,
    prop,
    updater: (mutableTarget, newValue) => {
      if (updater) {
        updater(mutableTarget, newValue);
      } else {
        mutableTarget[prop] = newValue;
      }
    },
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
    // if !state.currentComponent
    if (
      state.proxyIsMuted ||
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
        apply(func, applyTarget, [key, value]) {
          if (applyTarget.get(key) === value) return true; // No change, no need to carry on

          return handleSet({
            target: applyTarget,
            prop: key,
            value,
            updater: (finalTarget, newProxiedValue) => {
              // We call the set now, but with the new args
              Reflect.apply(finalTarget[prop], finalTarget, [
                key,
                newProxiedValue,
              ]);
            },
          });
        },
      });
    }

    // Adding to a Set
    if (prop === 'add') {
      return new Proxy(result, {
        apply(func, applyTarget, [value]) {
          if (applyTarget.has(value)) return true; // Would be a no op

          return handleSet({
            target: applyTarget,
            prop: value,
            value,
            updater: (finalTarget, newProxiedValue) => {
              Reflect.apply(finalTarget[prop], finalTarget, [newProxiedValue]);
            },
          });
        },
      });
    }

    // On either a Set or Map
    if (prop === 'clear' || prop === 'delete') {
      return new Proxy(result, {
        apply(func, applyTarget, [key]) {
          if (prop === 'delete' && !applyTarget.has(key)) return result; // Would not be a change

          return handleSet({
            target: applyTarget,
            prop,
            updater: finalTarget => {
              Reflect.apply(finalTarget[prop], finalTarget, [key]);
            },
          });
        },
      });
    }

    // Now that we've ruled out set/clear/delete, we can bail if we're not in the render cycle
    if (!state.currentComponent) return result;

    // For `size` or any getter method, subscribe to size changes and return
    if (
      ['size', 'get', 'entries', 'forEach', 'has', 'keys', 'values'].includes(
        prop
      )
    ) {
      addListener(makePath(target, 'size'));
      // TODO (davidg): do I not log the get on some Map or Set reads?
      return result;
    }

    // TODO (davidg): does 'size' need to be below this? Would I be getting the wrong size?
    if (isGettingPropOutsideOfRenderCycle(prop)) {
      return getFromNextStore(target, prop);
    }

    return result;
  },
};

let isInBulkOperation = false;

export const objectOrArrayProxyHandler = {
  get(target, prop) {
    const result = Reflect.get(target, prop);
    if (isInBulkOperation) return result;

    // TODO (davidg): array.pop() when empty can bail. But that's not easy
    if (
      Array.isArray(target) &&
      typeof target[prop] === 'function' &&
      ['sort', 'reverse', 'shift', 'splice', 'unshift', 'copyWithin'].includes(
        prop
      )
    ) {
      // These methods can rearrange an array over multiple steps. We don't want to trigger
      // any renders during this operation, so we set isInBulkOperation
      return new Proxy(result, {
        apply(applyTarget, applyProp, args) {
          isInBulkOperation = true;
          const applyResult = Reflect.apply(applyTarget, applyProp, args);
          isInBulkOperation = false;
          return applyResult;
        },
      });
    }

    if (utils.isFunction(target[prop])) return result;

    // TODO (davidg): don't test for bulk operation here?
    if (
      !isInBulkOperation &&
      !state.currentComponent &&
      utils.isInBrowser() &&
      !utils.isSymbol(prop) &&
      !state.proxyIsMuted &&
      prop !== 'constructor'
    ) {
      // Note, this will result in another get(), but on the equivalent
      // target from the next store. muteProxy will be set so this line
      // isn't triggers in an infinite loop
      return getFromNextStore(target, prop);
    }

    // TODO (davidg): test for isInBulkOperation here?
    if (shouldBypassProxy(prop)) return result;

    debug(() => {
      console.groupCollapsed(`GET: ${makeUserFriendlyPath(target, prop)}`);
      console.info(`Component: <${state.currentComponent._name}>`);
      console.info('Value:', result);
      console.groupEnd();
    });

    addListener(makePath(target, prop));

    return result;
  },

  has(target, prop) {
    if (
      state.proxyIsMuted ||
      !utils.isInBrowser() ||
      utils.isArray(target) // Arrays call this trap, but we don't care
    ) {
      return Reflect.has(target, prop);
    }

    debug(() => {
      console.groupCollapsed(`GET: ${makeUserFriendlyPath(target, prop)}`);
      console.info(`Component: <${state.currentComponent._name}>`);
      console.groupEnd();
    });

    addListener(makePath(target, prop));

    return Reflect.has(target, prop);
  },

  set(target, prop, value) {
    // We need to let the 'length' change through, even if it doesn't change, so it can
    // trigger listeners and update components.
    // This could happen e.g. when sort() changes individual items in an array. It will fire
    // a set() on 'length' (helpful!) which tells us we need to update.
    if (prop !== 'length' && target[prop] === value) return true;

    if (state.proxyIsMuted || !utils.isInBrowser()) {
      return Reflect.set(target, prop, value);
    }

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
    if (state.proxyIsMuted || !utils.isInBrowser()) {
      return Reflect.deleteProperty(target, prop);
    }

    debug(() => {
      console.groupCollapsed(`DELETE: ${makeUserFriendlyPath(target, prop)}`);
      console.info('Property: ', makeUserFriendlyPath(target, prop));
      console.groupEnd();
    });

    updateStoreAtPath({
      target,
      prop,
      updater: finalTarget => {
        Reflect.deleteProperty(finalTarget, prop);
      },
    });

    return true;
  },
};

export const getHandlerForObject = obj =>
  utils.isMapOrSet(obj) ? mapOrSetProxyHandler : objectOrArrayProxyHandler;
