import { createProxy, decorateWithPathAndProxy, isProxy } from 'src/proxy';
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

const cloneAnything = anything => {
  let result;

  if (utils.isArray(anything)) {
    // TODO (davidg): there's a need for a cloneWithPath shortcut
    result = createProxyWithHandler(anything.slice());
    addPathProp(result, anything[PATH_PROP]);
  } else if (utils.isMap(anything)) {
    result = createProxyWithHandler(utils.cloneMap(anything));
    addPathProp(result, anything[PATH_PROP]);
  } else if (utils.isSet(anything)) {
    result = createProxyWithHandler(utils.cloneSet(anything));
    addPathProp(result, anything[PATH_PROP]);
  } else if (utils.isPlainObject(anything)) {
    result = { ...anything };
    if (isProxy(anything) && !isProxy(result)) {
      result = createProxyWithHandler(result);
    }
    addPathProp(result, anything[PATH_PROP]);
  } else {
    console.warn('> did not expect this:', anything);
  }

  return result;
};

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
export const updateStoreAtPath = ({ target, prop, value, updater }) => {
  // TODO (davidg): "updateTargetInStore"

  state.proxyIsMuted = true;

  // Note that this function doesn't know anything about the prop being set. It just finds the
  // target (the parent of the prop) and calls updater() with it.
  const propArray = target[PATH_PROP].slice(1);

  // Shallow clone the existing store. We will clone all the way down to the target object
  // TODO (davidg): is there a reason this doesn't operate on the next store
  // directly?
  const newStore = { ...state.store };

  // This walks down into the object, returning the target.
  // On the way in clones each level so as not to mutate the original store.
  const finalTarget = propArray.reduce((mutableTarget, propName) => {
    // If we're updating a prop at data.tasks[2].done, we need to shallow clone every step on
    // the way down so that we're not mutating them.
    const targetClone = cloneAnything(mutableTarget);

    let nextLevelDown;

    if (utils.isMap(mutableTarget)) {
      // TODO (davidg): isn't it an error if this doesn't exist?
      nextLevelDown = mutableTarget.has(propName)
        ? mutableTarget.get(propName)
        : {};
      targetClone.set(propName, nextLevelDown);
    } else if (utils.isSet(mutableTarget)) {
      nextLevelDown = mutableTarget.has(propName)
        ? mutableTarget.get(propName)
        : {};
      targetClone.add(nextLevelDown);
    } else {
      // When a prop doesn't exist, create a new object, so we can deep set a value.
      nextLevelDown = propName in mutableTarget ? mutableTarget[propName] : {};
      targetClone[propName] = nextLevelDown;
    }

    return nextLevelDown;
  }, newStore);

  // If this is updating with a new value (rather than deleting)
  // We prepare that value now
  const path = makePath(target, prop);

  let newValue = value;

  // If there's a value, wrap it in a proxy
  if (value !== 'undefined') {
    const handler = getHandlerForObject(value);
    newValue = decorateWithPathAndProxy(value, path, handler);
  }

  // TODO (davidg): of course this doesn't work! It mutates the object!
  // use utils.deepUpdate() instead
  updater(finalTarget, newValue);

  addPathProp(newStore, [`store-${storeCount++}`]);
  state.nextStore = createProxyWithHandler(newStore);

  state.proxyIsMuted = false;

  // TODO (davidg): at this point, I should lock/freeze 'store', since any
  //  change to it mutates what the components used to render.

  notifyByPath(path);
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
 * Replace the contents of the old store with the new store.
 * DO NOT replace the old store object since the user's app
 * will have a reference to it
 * @param next
 */
export const setStore = next => {
  state.proxyIsMuted = true;
  replaceObject(state.store, next);
  state.proxyIsMuted = false;
};

/**
 * Unlike setStore() this doesn't mute the proxy, so objects are still
 * wrapped and components are updated as a result
 * @param data
 */
export const initStore = data => {
  replaceObject(state.nextStore, data);
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
