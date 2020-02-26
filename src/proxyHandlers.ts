import { getFromNextStore, updateInNextStore } from 'src/store';

import { debug } from 'src/shared/debug';
import state from 'src/shared/state';
import * as utils from 'src/shared/utils';
import * as paths from 'src/shared/paths';
import { IS_OLD_STORE } from 'src/shared/constants';

/**
 * Add a new listener to be notified when a particular value in the store changes
 * To be used when a component reads from a property
 */
const addListener = (pathArray: any[]) => {
  if (!state.currentComponent) return;
  // We use a string instead of an array because it's much easier to match
  const pathString = paths.makeInternalString(pathArray);

  const components = state.listeners.get(pathString) || new Set();
  components.add(state.currentComponent);
  state.listeners.set(pathString, components);
};

/**
 * We bypass the proxy if we don't want to:
 * a) record a GET of a prop and add a listener for that prop path
 * b) emit a SET and trigger listeners (which re-render components)
 */
// TODO (davidg): there's only one use of this now, move it back down
const shouldBypassProxy = (prop: string): boolean =>
  state.proxyIsMuted ||
  !state.isInBrowser ||
  !state.currentComponent ||
  utils.isSymbol(prop) ||
  prop === 'constructor' ||
  prop === 'toJSON';

/**
 * Is this an attempt to get something from the store outside the render cycle?
 * This might be store.tasks.push() in a click event right after doing store.tasks = []
 * In this case, we should always return from nextStore.
 * @see setStoreTwiceInOnClick.test.js
 */
const isGettingPropOutsideOfRenderCycle = (prop: string) =>
  !state.currentComponent &&
  state.isInBrowser &&
  !utils.isSymbol(prop) &&
  prop !== 'constructor' && // TODO (davidg): maybe 'is exotic'? Check hasOwnProps? Slow?
  !state.proxyIsMuted;

/**
 * This function takes an instruction to update the store. For simple properties, it will update
 * the store with target[prop] = value. It also takes an update function, allowing the caller
 * to update the store in a specific manner. E.g. target.clear(), where target is a Map.
 */

// TODO (davidg): this is duplicated with store.ts
type ForwardSetToNextStoreProps = {
  target: object;
  prop?: string;
  value?: any;
  updater: (target: any, value: any) => void;
};

const forwardSetToNextStore = ({
  target,
  prop,
  value,
  updater,
}: ForwardSetToNextStoreProps) => {
  // TODO (davidg): I should mute the proxy here already, right? Do this when I no longer
  //  call updateInNextStore() from two places below
  debug(() => {
    console.groupCollapsed(`SET: ${paths.extendToUserString(target, prop)}`);
    console.info('From:', utils.getValue(target, prop));
    console.info('To:  ', value);
    console.groupEnd();
  });

  updateInNextStore({
    target,
    value,
    prop,
    updater: (mutableTarget, newValue) => {
      updater(mutableTarget, newValue);
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
      !state.isInBrowser ||
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

          return forwardSetToNextStore({
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

          return forwardSetToNextStore({
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

          return forwardSetToNextStore({
            target: applyTarget,
            prop,
            updater: (finalTarget) => {
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
      addListener(paths.extend(target, 'size'));
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

export const objectOrArrayProxyHandler = {
  get(target, prop) {
    if (IS_OLD_STORE in target && state.currentComponent) {
      throw Error(
        `You are trying to read "${prop}" from the global store while rendering 
        a component. This could result in subtle bugs. Instead, read from the 
        store object passed as a prop to your component.`
      );
    }

    const result = Reflect.get(target, prop);
    // TODO (davidg): array.pop() when empty can bail. But that's not easy

    if (utils.isFunction(target[prop])) return result;

    if (
      !state.currentComponent &&
      state.isInBrowser &&
      !utils.isSymbol(prop) &&
      !state.proxyIsMuted &&
      prop !== 'constructor'
    ) {
      // Note, this will result in another get(), but on the equivalent
      // target from the next store. muteProxy will be set so this line
      // isn't triggers in an infinite loop
      return getFromNextStore(target, prop);
    }

    if (shouldBypassProxy(prop)) return result;

    debug(() => {
      console.groupCollapsed(`GET: ${paths.extendToUserString(target, prop)}`);
      console.info(`Component: <${state.currentComponent!._name}>`);
      console.info('Value:', result);
      console.groupEnd();
    });

    addListener(paths.extend(target, prop));

    return result;
  },

  has(target, prop) {
    // Arrays use `has` too, but we capture a listener elsewhere for that.
    // Here we only want to capture access to objects
    if (state.currentComponent && !utils.isArray(target)) {
      debug(() => {
        console.groupCollapsed(
          `GET: ${paths.extendToUserString(target, prop)}`
        );
        console.info(`Component: <${state.currentComponent!._name}>`);
        console.groupEnd();
      });

      addListener(paths.extend(target, prop));
    }

    // TODO (davidg): should this be from the next store? Test, etc.
    return Reflect.has(target, prop);
  },

  ownKeys(target) {
    if (state.currentComponent) {
      debug(() => {
        console.groupCollapsed(`GET: ${paths.extendToUserString(target)}`);
        console.info(`Component: <${state.currentComponent!._name}>`);
        console.groupEnd();
      });

      addListener(paths.get(target));
    }

    return Reflect.ownKeys(target);
  },

  set(target, prop, value) {
    if (state.currentComponent) {
      throw Error(
        `You are modifying the store during a render cycle. Don't do this.
        You're setting "${prop}" to "${value}" somewhere; check the stack 
        trace below.
        If you're changing the store in componentDidMount, wrap your code in a
        setTimeout() to allow the render cycle to complete before changing the store.`
      );
    }

    // We need to let the 'length' change through, even if it doesn't change, so it can
    // trigger listeners and update components.
    // This could happen e.g. when sort() changes individual items in an array. It will fire
    // a set() on 'length' (helpful!) which tells us we need to update.
    if (prop !== 'length' && target[prop] === value) return true;

    if (state.proxyIsMuted || !state.isInBrowser) {
      return Reflect.set(target, prop, value);
    }

    return forwardSetToNextStore({
      target,
      prop,
      value,
      updater: (finalTarget, newValueProxy) => {
        Reflect.set(finalTarget, prop, newValueProxy);
      },
    });
  },

  deleteProperty(target, prop) {
    if (state.proxyIsMuted || !state.isInBrowser) {
      return Reflect.deleteProperty(target, prop);
    }

    debug(() => {
      console.groupCollapsed(
        `DELETE: ${paths.extendToUserString(target, prop)}`
      );
      console.info('Property: ', paths.extendToUserString(target, prop));
      console.groupEnd();
    });

    updateInNextStore({
      target,
      prop,
      updater: (finalTarget) => {
        Reflect.deleteProperty(finalTarget, prop);
      },
    });

    return true;
  },
};

export const getHandlerForObject = (obj: any): object =>
  utils.isMapOrSet(obj) ? mapOrSetProxyHandler : objectOrArrayProxyHandler;
