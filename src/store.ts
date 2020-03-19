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
}) =>
  utils.whileMuted(() => {
    let result: any;

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
    const initialSize = utils.getSize(target);

    let newValue = value;

    // Make sure the new value is deeply wrapped in proxies, if it's a target
    if (utils.isTarget(newValue)) {
      newValue = utils.updateDeep(value, (item, thisPropPath) => {
        if (!utils.isTarget(item)) return item;

        const next = utils.clone(item);
        paths.addProp(next, [...propPath, ...thisPropPath]);

        return proxyManager.createShallow(next);
      });
    }

    if (!targetPath.length) {
      // If the target is the store root, it's mutated in place.
      result = updater(state.store, newValue);
      targetChangedSize = utils.getSize(state.store) !== initialSize;
    } else {
      targetPath.reduce((item, thisProp, i) => {
        const thisValue = utils.getValue(item, thisProp);

        // Shallow clone this level
        let clone = utils.clone(thisValue);
        paths.addProp(clone, paths.get(thisValue));

        // Wrap the clone in a proxy
        clone = proxyManager.createShallow(clone);

        // Mutate this level (swap out the original for the clone)
        utils.setValue(item, thisProp, clone);

        // If we're at the end of the path, then 'clone' is our target
        if (i === targetPath.length - 1) {
          result = updater(clone, newValue);
          targetChangedSize = utils.getSize(clone) !== initialSize;

          // We keep a reference between the original target and the clone
          // `target` may or may not be wrapped in a proxy (Maps and Sets are)
          // So we check/get the unproxied version
          state.nextVersionMap.set(target[ORIGINAL] || target, clone);
        }

        return clone;
      }, state.store);
    }

    // If the 'size' of a target changes, it's reasonable to assume that
    // users of the target are going to need to re-render, else use the prop
    const notifyPath =
      notifyTarget || targetChangedSize ? targetPath : propPath;

    notifyByPath(notifyPath);

    return result;
  });

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
