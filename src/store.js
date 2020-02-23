import { createProxy, decorateWithPathAndProxy } from 'src/proxy';
import { getHandlerForObject } from 'src/proxyHandlers';
import { notifyByPath } from 'src/updating';

import state from 'src/shared/state';
import * as utils from 'src/shared/utils';
import * as paths from 'src/shared/paths';

const createProxyWithHandler = obj =>
  createProxy(obj, getHandlerForObject(obj));

state.store = createProxyWithHandler({});
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
  const targetPath = paths.get(target);
  const propPath = paths.extend(target, prop);

  let newValue = value;

  // If there's a value being set, wrap it in a proxy
  if (value !== 'undefined') {
    const handler = getHandlerForObject(value);
    newValue = decorateWithPathAndProxy(value, propPath, handler);
  }

  if (!targetPath.length) {
    state.nextStore = { ...state.nextStore };
    updater(state.nextStore, newValue);
  } else {
    state.nextStore = utils.deepUpdate({
      object: state.nextStore,
      path: targetPath,
      onClone: (original, clone) => {
        if (paths.get(original)) {
          paths.addProp(clone, paths.get(original));
        }
        return createProxyWithHandler(clone);
      },
      updater: updateTarget => {
        updater(updateTarget, newValue);
      },
    });
  }

  state.nextStore = createProxyWithHandler(state.nextStore);

  state.proxyIsMuted = false;

  notifyByPath(propPath);
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

  const propPath = paths.extend(target, targetProp);

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
    if (paths.has(nextObject)) {
      // Copy the new path root across
      paths.set(prevObject, paths.get(nextObject));
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
  // TODO (davidg): rename to prevStore/store
  // TODO (davidg): if I move this into update.js, and move
  //  replaceObject into utils, I can remove a cyclic dependency
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

export const batch = cb => {
  state.isBatchUpdating = true;
  cb();
  state.isBatchUpdating = false;
};
