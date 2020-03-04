import * as proxy from './proxy';
import { notifyByPath } from './updating';
import state from './shared/state';
import * as utils from './shared/utils';
import * as paths from './shared/paths';
import { Store, Target } from './shared/types';

state.nextStore = proxy.createShallow({});
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
}: {
  target: Target;
  prop?: any;
  value?: any;
  updater: (target: Target, value: any) => void;
}): void => {
  state.proxyIsMuted = true;

  // Note that this function doesn't know anything about the prop being set.
  // It just finds the target (the parent of the prop) and
  // calls updater() with it.
  const targetPath = paths.get(target);
  const propPath = paths.extend(target, prop);

  // Make sure the new value is deeply wrapped in proxies
  const newValue = proxy.createDeep(value, propPath);

  state.nextStore = utils.deepUpdate({
    object: state.nextStore,
    propPath: targetPath,
    afterClone: (original, clone) => {
      if (paths.get(original)) {
        paths.addProp(clone, paths.get(original));
      }
      return proxy.createShallow(clone);
    },
    updater: (updateTarget) => {
      updater(updateTarget, newValue);
    },
  });

  state.proxyIsMuted = false;

  notifyByPath(propPath);
};

/**
 * This takes a target (from one version of the store) and gets its value
 * in `nextStore`.
 */
export const getFromNextStore = (target: Target, targetProp: any): any => {
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
 */
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
