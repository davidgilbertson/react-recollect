import { createProxy, isProxy, muteProxy, unMuteProxy } from './proxy';
import { addPathProp } from './general';
import { PATH_PROP, SEP } from './constants';

const rawStore = {};

addPathProp(rawStore, 'store');

export let store = createProxy(rawStore);

// Thanks to https://github.com/debitoor/dot-prop-immutable
export const updateStoreAtPath = ({
                                    path,
                                    value,
                                    deleteItem,
                                  }) => {
  // muteProxy = true; // don't need to keep logging gets.
  muteProxy();

  const propArray = path.split(SEP);
  propArray.shift(); // we don't need 'store'.

  const update = (target, i) => {
    if (i === propArray.length) return value;
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

  // muteProxy = false;
  unMuteProxy();

  // The clone of the top level won't be a proxy object
  // TODO (davidg): actually newStore will already be a proxy, no?
  if (isProxy(newStore)) {
    return newStore;
  }
  console.log('Well this is unexpected, the store is not a proxy?');
  return createProxy(newStore);
};

export const getStore = () => store;

export const setStore = newStore => {
  store = newStore;
};
