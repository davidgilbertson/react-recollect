import { createProxy, decorateWithPathAndProxy } from 'src/proxy';
import { getHandlerForObject } from 'src/proxyHandlers';
import { notifyByPath } from 'src/updating';

import state from 'src/shared/state';
import { addPathProp, makePath } from 'src/shared/general';
import { PATH_PROP } from 'src/shared/constants';
import * as utils from 'src/shared/utils';

const createProxyWithHandler = obj =>
  createProxy(obj, getHandlerForObject(obj));

const rawStore = {};
let storeCount = 0;
addPathProp(rawStore, [`store-${storeCount++}`]); // TODO (davidg): why is
// store even here?

state.store = createProxyWithHandler(rawStore);
state.nextStore = state.store;

/**
 * This function immutably updates a target in the store, returning the new store.
 * It doesn't update the target directly, but calls an update() function which
 *  will perform the update.
 *
 * @param props
 * @param {*} props.target - the target in the current store
 * @param {*} props.prop - the target in the current store
 * @param {*} [props.value] - the target in the current store
 * @param {function} props.updater - a function that will be passed the target
 * @return {*}
 */
export const updateInNextStore = ({ target, prop, value, updater }) => {
  state.proxyIsMuted = true;

  // Note that this function doesn't know anything about the prop being set. It just finds the
  // target (the parent of the prop) and calls updater() with it.
  const propArray = target[PATH_PROP].slice(1);

  const path = makePath(target, prop);
  let newValue = value;

  // If there's a value being set, wrap it in a proxy
  if (value !== 'undefined') {
    const handler = getHandlerForObject(value);
    newValue = decorateWithPathAndProxy(value, path, handler);
  }

  if (!propArray.length) {
    state.nextStore = { ...state.nextStore };
    updater(state.nextStore, newValue);
  } else {
    state.nextStore = utils.deepUpdate({
      object: state.nextStore,
      path: propArray,
      onClone: (original, clone) => {
        if (original[PATH_PROP]) {
          addPathProp(clone, original[PATH_PROP]);
        }
        return createProxyWithHandler(clone);
      },
      updater: updateTarget => {
        updater(updateTarget, newValue);
      },
    });
  }

  addPathProp(state.nextStore, [`store-${storeCount++}`]);
  state.nextStore = createProxyWithHandler(state.nextStore);

  state.proxyIsMuted = false;

  notifyByPath(path);
};

/**
 * This takes a target (from one version of the store) and gets its value
 * in `nextStore`.
 * @param target
 * @param targetProp
 * @return {*}
 */
export const getFromNextStore = (target, targetProp) => {
  state.proxyIsMuted = true;

  const propPath = makePath(target, targetProp).slice(1);

  const result = propPath.reduce(
    (acc, propName) => utils.getValue(acc, propName),
    state.nextStore
  );

  state.proxyIsMuted = false;

  return result;
};

/**
 * Mutates prevObject. The top level object will remain the same,
 * but all changed content will be replaced with the new content.
 * In other words, only the top-level object is mutated.
 * @param {object} prevObject
 * @param {object} nextObject
 */
const replaceObject = (prevObject, nextObject) => {
  /* eslint-disable no-param-reassign */
  if (nextObject) {
    if (nextObject[PATH_PROP]) {
      // Copy the new path root across
      prevObject[PATH_PROP] = nextObject[PATH_PROP];
    }

    // From the new data, add to the old data anything that's new
    // (from the top level props only)
    Object.entries(nextObject).forEach(([prop, value]) => {
      if (prevObject[prop] !== value) {
        prevObject[prop] = value;
      }
    });

    // Clear out any keys that aren't in the new data
    Object.keys(prevObject).forEach(prop => {
      if (!(prop in nextObject)) {
        delete prevObject[prop];
      }
    });
  } else {
    // Just empty the old object
    Object.keys(prevObject).forEach(prop => {
      delete prevObject[prop];
    });
  }
  /* eslint-enable no-param-reassign */
};

/**
 * Between render cycles, store changes are made in state.nextStore
 * nextStore is used to render components. Then in this
 * function, those changes are moved into state.store. This should be the
 * only place that state.store is written to.
 */
export const collapseStore = () => {
  state.proxyIsMuted = true;
  replaceObject(state.store, state.nextStore);
  state.proxyIsMuted = false;
};

/**
 * Unlike collapseStore() this doesn't mute the proxy, so objects are still
 * wrapped and components are updated as a result
 * @param data
 */
export const initStore = data => {
  replaceObject(state.nextStore, data);
};
