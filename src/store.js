import { createProxy, isProxy, muteProxy, unMuteProxy } from './proxy';
import { addPathProp } from './general';
import { PATH_PROP, PROP_PATH_SEP } from './constants';

const rawStore = {};

addPathProp(rawStore, 'store');

export const store = createProxy(rawStore);

let nextStore;

export const updateStoreAtPath = ({ path, value, deleteItem }) => {
  muteProxy();

  const propArray = path.split(PROP_PATH_SEP);
  propArray.shift(); // we don't need 'store'.

  const update = (target, i) => {
    if (i === propArray.length) return createProxy(value); // value might be [] or {}
    const isLastProp = i === propArray.length - 1;

    let thisProp = propArray[i];
    let targetClone;


    // We'll be cloning proxied objects with non-enumerable props
    // So we need to add these things back after cloning
    if (Array.isArray(target)) {
      targetClone = createProxy(target.slice());
      addPathProp(targetClone, target[PATH_PROP]);

      // If this is adding something to an array
      if (isLastProp && thisProp >= target.length) {
        // const isObjectOrArray = Array.isArray(value) || isObject(value);
        // targetClone[thisProp] = isObjectOrArray ? createProxy(value) : value;
        targetClone[thisProp] = createProxy(value);
        // TODO (davidg): add path?
        return targetClone;
      }
    } else {
      targetClone = Object.assign({}, target);
      if (isProxy(target) && !isProxy(targetClone)) {
        targetClone = createProxy(targetClone);
      }
      addPathProp(targetClone, target[PATH_PROP]);
    }

    if (i === propArray.length - 1 && deleteItem) {
      delete targetClone[thisProp];
      return targetClone;
    }

    const next = target[thisProp] === undefined ? {} : target[thisProp];
    targetClone[thisProp] = update(next, i + 1);

    return targetClone;
  };

  const newStore = update(store, 0);

  addPathProp(newStore, 'store');

  unMuteProxy();

  return createProxy(newStore);
};

const resetStore = () => {
  Object.keys(store).forEach(prop => {
    delete store[prop];
  });
};

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

// TODO (davidg):  should getStore() just do nextStore || store?
// will getStore ever be called to get the last one?
export const getNextStore = () => nextStore || store;
