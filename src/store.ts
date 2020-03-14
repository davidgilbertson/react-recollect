import * as proxyManager from './proxyManager';
import * as pubSub from './shared/pubSub';
import { notifyByPath } from './updating';
import state from './shared/state';
import * as utils from './shared/utils';
import * as paths from './shared/paths';
import { Store, UpdateInNextStore } from './shared/types';
import { IS_GLOBAL_STORE, ORIGINAL } from './shared/constants';

state.store = proxyManager.createShallow({});

/**
 * The `IS_GLOBAL_STORE` prop at the top level allows us to differentiate
 * between the 'global' store and the one passed to components.
 */
Object.defineProperty(state.store, IS_GLOBAL_STORE, {
  value: true,
});

/**
 * This function immutably updates a target in the store, returning the new store.
 * It doesn't update the target directly, but calls an update() function which
 * will perform the update.
 */
export const updateInNextStore: UpdateInNextStore = ({
  target,
  prop,
  value,
  updater,
}) => {
  state.proxyIsMuted = true;

  // Note that this function doesn't know anything about the prop being set.
  // It just finds the target (the parent of the prop) and
  // calls updater() with it.
  const targetPath = paths.get(target);
  const propPath = paths.extend(target, prop);

  // Make sure the new value is deeply wrapped in proxies
  const newValue = proxyManager.createDeep(value, propPath);

  // TODO (davidg): update deepUpdate to mutate 'object'
  const tempNextStore = utils.deepUpdate({
    object: state.store,
    propPath: targetPath,
    afterClone: (original, clone) => {
      if (paths.get(original)) {
        paths.addProp(clone, paths.get(original));
      }

      return proxyManager.createShallow(clone);
    },
    updater: (updateTarget) => {
      updater(updateTarget, newValue);

      // `target` may or may not be wrapped in a proxy (Maps and Sets are)
      // So we check/get the unproxied version
      state.nextVersionMap.set(target[ORIGINAL] || target, updateTarget);
    },
  });

  utils.replaceObject(state.store, tempNextStore);

  state.proxyIsMuted = false;

  notifyByPath(propPath);
};

pubSub.onUpdateInNextStore(updateInNextStore);

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
