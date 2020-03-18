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
  notifyTarget = false,
  updater,
}) => {
  state.proxyIsMuted = true;
  let result: any;
  const initialSize = utils.getSize(target);

  // This function doesn't know anything about the prop being set.
  // It just finds the target (the parent of the prop) and
  // calls updater() with it.
  const targetPath = paths.get(target);

  // Note that if this update is a method (e.g. arr.push()) then prop can be
  // undefined, meaning the prop path won't be extended, and will just be
  // the path of the target (the array) which is correct.
  const propPath = paths.extend(target, prop);

  // If we change the length/size of an array/map/set, we will want to
  // trigger a render of the parent path.
  let targetChangedSize = false;

  // Make sure the new value is deeply wrapped in proxies
  const newValue = proxyManager.createDeep(value, propPath);

  if (!targetPath.length) {
    // If the target is the store root, it's mutated in place.
    result = updater(state.store, newValue);
    targetChangedSize = utils.getSize(state.store) !== initialSize;
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
        result = updater(updateTarget, newValue);
        targetChangedSize = utils.getSize(updateTarget) !== initialSize;

        // `target` may or may not be wrapped in a proxy (Maps and Sets are)
        // So we check/get the unproxied version
        state.nextVersionMap.set(target[ORIGINAL] || target, updateTarget);
      },
    });
  }

  state.proxyIsMuted = false;

  // If the 'size' of a target changes, it's reasonable to assume that
  // target is going to need to re-render, so we target it.
  const notifyPath = notifyTarget || targetChangedSize ? targetPath : propPath;

  notifyByPath(notifyPath);

  if (process.env.NODE_ENV === 'development') {
    if (!result) throw Error('no updater was passed, or it did not return');
  }

  return result;
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
