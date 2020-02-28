import { createProxy, decorateWithPathAndProxy } from './proxy';
import { getHandlerForObject } from './proxyHandlers';
import { notifyByPath } from './updating';
import state from './shared/state';
import * as utils from './shared/utils';
import * as paths from './shared/paths';
import { Store, StoreUpdater } from './types/store';

const createProxyWithHandler = (obj) =>
  createProxy(obj, getHandlerForObject(obj));

state.nextStore = createProxyWithHandler({});
state.store = state.nextStore;

/**
 * This function immutably updates a target in the store, returning the new store.
 * It doesn't update the target directly, but calls an update() function which
 *  will perform the update.
 */
export const updateInNextStore = ({
  target,
  prop,
  value,
  updater,
}: StoreUpdater) => {
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
      updater: (updateTarget) => {
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
 */
export const getFromNextStore = (target: object, targetProp: string): any => {
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
 * Empty the Recollect store and replace it with new data.
 * Use this in conjunction with server rendering.
 * E.g. set window.__PRELOADED_STATE__ on the server, then
 * initStore(window.__PRELOADED_STATE__) just before calling
 * React.hydrate(<YourApp /> ...)
 *
 * Unlike collapseStore() this doesn't mute the proxy, so objects are still
 * wrapped and components are updated as a result
 */
// TODO (davidg): this doesn't seem to warn in disco-mundus when the data
//  isn't store
export const initStore = (data?: Partial<Store>) => {
  utils.replaceObject(state.store, data);
};

/**
 * Executes the provided function, then updates appropriate components and calls
 * listeners registered with `afterChange()`. Guaranteed to only trigger one
 * update. The provided function must only contain synchronous code.
 */
export const batch = (cb: () => void) => {
  state.isBatchUpdating = true;
  cb();
  state.isBatchUpdating = false;
};
