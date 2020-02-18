import { createProxy, isProxy, muteProxy, unMuteProxy } from './proxy';
import { addPathProp, makePath } from './general';
import { PATH_PROP } from './constants';
import * as utils from './utils';

const rawStore = {};

addPathProp(rawStore, ['store']); // TODO (davidg): why is store ever here?

export const store = createProxy(rawStore);

let nextStore;

const cloneAnything = anything => {
  let result;

  if (utils.isArray(anything)) {
    // TODO (davidg): there's a need for a cloneWithPath shortcut
    result = createProxy(anything.slice());
    addPathProp(result, anything[PATH_PROP]);
  } else if (utils.isMap(anything)) {
    result = createProxy(utils.cloneMap(anything));
    addPathProp(result, anything[PATH_PROP]);
  } else if (utils.isSet(anything)) {
    result = createProxy(utils.cloneSet(anything));
    addPathProp(result, anything[PATH_PROP]);
  } else if (utils.isPlainObject(anything)) {
    result = { ...anything };
    if (isProxy(anything) && !isProxy(result)) {
      result = createProxy(result);
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
 * @param {function} props.updater - a function that will be passed the target
 * @return {*}
 */
export const updateStoreAtPath = ({ target, updater }) => {
  // TODO (davidg): @callback for the updater
  // TODO (davidg): "updateTargetInStore"
  muteProxy();

  // Note that this function doesn't know anything about the prop being set. It just finds the
  // target (the parent of the prop) and calls updater() with it.
  const propArray = target[PATH_PROP].slice(1);

  // Shallow clone the existing store. We will clone all the way down to the target object
  const newStore = { ...store };

  // This walks down into the object, returning the target.
  // On the way in clones each level so as not to mutate the original store.
  const finalTarget = propArray.reduce((mutableTarget, prop) => {
    // If we're updating a prop at data.tasks[2].done, we need to shallow clone every step on
    // the way down so that we're not mutating them.
    const targetClone = cloneAnything(mutableTarget);

    let nextLevelDown;

    if (utils.isMap(mutableTarget)) {
      // TODO (davidg): isn't it an error if this doesn't exist?
      nextLevelDown = mutableTarget.has(prop) ? mutableTarget.get(prop) : {};
      targetClone.set(prop, nextLevelDown);
    } else if (utils.isSet(mutableTarget)) {
      nextLevelDown = mutableTarget.has(prop) ? mutableTarget.get(prop) : {};
      targetClone.add(nextLevelDown);
    } else {
      // When a prop doesn't exist, create a new object, so we can deep set a value.
      nextLevelDown = prop in mutableTarget ? mutableTarget[prop] : {};
      targetClone[prop] = nextLevelDown;
    }

    return nextLevelDown;
  }, newStore);

  // TODO (davidg): of course this doesn't work! It mutates the object!
  // use utils.deepUpdate
  updater(finalTarget);

  addPathProp(newStore, ['store']);

  unMuteProxy();

  // TODO (davidg): store is already a proxy by this point
  return createProxy(newStore);
};

const resetStore = () => {
  Object.keys(store).forEach(prop => {
    delete store[prop];
  });
};

// Calling this directly doesn't mute the proxy
// So items added are wrapped in a proxy. Perhaps there's a better way to do this
// (I want to mute the proxy emitting, but DO want new items wrapped in a proxy)
export const initStore = data => {
  resetStore();

  if (data) {
    Object.entries(data).forEach(([prop, value]) => {
      store[prop] = value;
    });
  }
};

export const getStore = () => store;

/**
 * Replace the contents of the old store with the new store.
 * DO NOT replace the old store object since the user's app will have a reference to it
 * @param next
 */
export const setStore = next => {
  muteProxy();

  initStore(next);

  unMuteProxy();
};

export const setNextStore = next => {
  nextStore = next;
};

// TODO (davidg): should getStore() just do nextStore || store?
// will getStore ever be called to get the last one?
export const getNextStore = () => nextStore || store;

export const getFromNextStore = (target, targetProp) => {
  muteProxy();

  let result;

  const propPath = makePath(target, targetProp);

  // TODO (davidg): reduce
  propPath.forEach(propName => {
    if (propName === 'store') {
      result = getNextStore();
    } else {
      result = utils.getValue(result, propName);
    }
  });

  unMuteProxy();

  return result;
};
