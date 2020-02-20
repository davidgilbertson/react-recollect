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

addPathProp(rawStore, ['store']); // TODO (davidg): why is store even here?

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

  addPathProp(newStore, ['store']);

  state.proxyIsMuted = false;

  // TODO (davidg): at this point, I should lock/freeze 'store', since any
  //  change to it mutates what the components used to render.

  notifyByPath({
    path,
    // TODO (davidg): store is already a proxy by this point, no?
    newStore: createProxyWithHandler(newStore),
  });
};

// TODO (davidg): why would I ever want to init the store without muting the
//  proxies?
// Calling this directly doesn't mute the proxy
// So items added are wrapped in a proxy. Perhaps there's a better way to do this
// (I want to mute the proxy emitting, but DO want new items wrapped in a proxy)
export const initStore = data => {
  // Delete everything first
  // TODO (davidg): I can make this faster. No need to delete and add identical
  //  things back in. Might require a semver major bump
  Object.keys(state.store).forEach(prop => {
    delete state.store[prop];
  });

  if (data) {
    Object.entries(data).forEach(([prop, value]) => {
      state.store[prop] = value;
    });
  }
};

/**
 * Replace the contents of the old store with the new store.
 * DO NOT replace the old store object since the user's app will have a reference to it
 * @param next
 */
export const setStore = next => {
  state.proxyIsMuted = true;

  initStore(next);

  state.proxyIsMuted = false;
};

export const getFromNextStore = (target, targetProp) => {
  state.proxyIsMuted = true;

  let result;

  const propPath = makePath(target, targetProp);

  // TODO (davidg): reduce
  propPath.forEach(propName => {
    if (propName === 'store') {
      result = state.nextStore;
    } else {
      result = utils.getValue(result, propName);
    }
  });

  state.proxyIsMuted = false;

  return result;
};
