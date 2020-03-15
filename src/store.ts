import * as proxyManager from './proxyManager';
import * as pubSub from './shared/pubSub';
import { notifyByPath } from './updating';
import state from './shared/state';
import * as utils from './shared/utils';
import * as paths from './shared/paths';
import { Store, UpdateInStore } from './shared/types';
import { ORIGINAL } from './shared/constants';

/**
 * This is the store, as exported to the user. When the store is passed to a
 * component, it is shallow cloned. This leaves us free to mutate the root
 * level directly.
 */
state.store = proxyManager.createShallow({});

/**
 * Deep update the store, the following rules are followed:
 * - If updating the root level, the store object itself is mutated.
 * - For any other (deep) update we clone each node along the path to
 *   the target to update (the target is cloned too).
 */
export const updateStore: UpdateInStore = ({
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

  if (!targetPath.length) {
    // If the target is the store root, it's mutated in place.
    updater(state.store, newValue);
  } else {
    utils.deepUpdate({
      mutableTarget: state.store,
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
  }

  state.proxyIsMuted = false;

  notifyByPath(propPath);
};

pubSub.onUpdateInNextStore(updateStore);

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
