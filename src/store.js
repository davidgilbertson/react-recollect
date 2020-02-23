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
 * Unlike collapseStore() this doesn't mute the proxy, so objects are still
 * wrapped and components are updated as a result
 * @param data
 */
export const initStore = data => {
  utils.replaceObject(state.nextStore, data);
};

export const batch = cb => {
  state.isBatchUpdating = true;
  cb();
  state.isBatchUpdating = false;
};
