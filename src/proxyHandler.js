import { log } from './logging';
import {
  decorateWithPathAndProxy,
  isObject,
  makePath,
} from './general';
import { isProxyMuted } from './proxy';
import { getCurrentComponent } from './collect';
import { addListener, notifyByPath, notifyByPathStart } from './updating';
import { updateStoreAtPath } from './store';
import { PATH_PROP } from './constants';

const proxyHandler = {
  get(target, prop) {
    if (isProxyMuted()) return Reflect.get(target, prop);
    // This will actually be called when reading PATH_PROP (so meta). Don't add a listener
    if (typeof prop === 'symbol') return Reflect.get(target, prop);

    // TODO (davidg): 'constructor' is reserved, what's the other reserved one?
    if (prop === 'constructor') return Reflect.get(target, prop);

    log.info(`---- GET ----`);
    log.info('GET component:', getCurrentComponent() ? getCurrentComponent()._name : 'none');
    log.info('GET target:', target);
    log.info('GET prop:', prop);

    if (Array.isArray(target)) {
      // If the TARGET is an array, e.g. if a component
      // checks someArray.length OR uses someArray.forEach() or .map() or .reduce(), etc.
      // Then it needs to be notified when the length changes
      addListener(target, 'length');
    } else {
      // otherwise, add a listener for whenever the target/prop is
      addListener(target, prop);
    }

    return Reflect.get(target, prop);
  },

  has(target, prop) {
    if (isProxyMuted()) return Reflect.has(target, prop);
    // has() also gets called when looping over an array. We don't care about that
    if (!Array.isArray(target)) {
      log.info(`---- HAS ----`);
      log.info('HAS target:', target);
      log.info('HAS prop:', prop);

      addListener(target, prop);
    }

    return Reflect.has(target, prop);
  },

  set(target, prop, value) {
    if (isProxyMuted()) return Reflect.set(target, prop, value);

    const path = makePath(target, prop);

    let valueToSet = value;

    // Add paths to this new value
    const newProxiedValue = decorateWithPathAndProxy(value, path);
    console.log('  --  >  proxyHandler.js:64 > set > newProxiedValue', newProxiedValue);
    console.log('  --  >  proxyHandler.js:64 > set > newProxiedValue', newProxiedValue);

    log.info(`---- SET ----`);
    log.info('SET target:', target);
    log.info('SET prop:', prop);
    log.info('SET from:', target[prop]);
    log.info('SET to:', newProxiedValue);

    if (Array.isArray(target)) {
      // Scenarios:
      // - target is array, prop is a number bigger than the array (adding an item, should update store by paths matching the parent)
      // - target is array, prop is length. Usually fired after some other update.
      // - target is array, prop is existing index, existing value is object. Then update all listeners for any properties on the object being replaced (by matching on the start of the path)
      if (prop === 'length') {
        if (newProxiedValue === 0) {
          console.log('I cannot do this trick yet!'); // TODO (davidg):
          // a special case of a user doing arr.length = 0; to empty an array
          valueToSet = []; // TODO (davidg): should be proxied
        } else {
          // otherwise probably fired by the JS engine after some other array change
          return true;
        }
      }

      if (!Number.isNaN(prop)) {
        const newStore = updateStoreAtPath({ path, value: newProxiedValue });

        // We're updating an object, to a new object
        // Now, we want anything that listens to any prop of the object in the array that is changing
        // to be updated
        // TODO (davidg): is this necessary any more? I'm no longer updating lower-level
        // components without updating their parents anyway.
        if (
          (isObject(target[prop]) && isObject(value)) ||
          Number(prop) >= target.length
        ) {
          notifyByPathStart({
            parentPath: target[PATH_PROP],
            newStore
          });

          return true;
        }
      }
    }

    // TODO (davidg): this actually needs to be a 'deep proxy' and deep path setting as well
    // whenever the value is an array or object. I could do that here, or do it in updateStoreAtPath.
    // if (Array.isArray(value)) {
    //   // We are CREATING or REPLACING an array, so wrap it, and its items, in proxies
    //   // TODO: I can do this in `decorateWithPath` to save looping through twice
    //   const wrappedItems = value.map((item, i) => {
    //     // For example, there may have been an existing array of proxied objects,
    //     // then some new, non-proxied objects were added. We'll need to wrap some but not
    //     // others
    //     addPathProp(item, `${path}.${i}`); // We might be updating the path for this one
    //     return canBeProxied(item) ? createProxy(item, proxyHandler) : item;
    //   });
    //
    //   valueToSet = isProxy(wrappedItems) ? wrappedItems : createProxy(wrappedItems, proxyHandler);
    //
    //   // We just created a new array, so we need to set this, again. Could be done better.
    //   addPathProp(valueToSet, path);
    // }

    const newStore = updateStoreAtPath({
      path,
      value: newProxiedValue,
    });

    notifyByPath({
      path,
      newStore,
    });

    return true;
  },

  deleteProperty(target, prop) {
    if (isProxyMuted()) return Reflect.deleteProperty(target, prop);

    log.info(`---- DELETE ----`);
    log.info('DELETE target:', target);
    log.info('DELETE prop:', prop);

    const path = makePath(target, prop);

    const newStore = updateStoreAtPath({
      path,
      deleteItem: true,
    });

    notifyByPath({
      path,
      newStore,
    });

    return true;
  }
};

export default proxyHandler;
