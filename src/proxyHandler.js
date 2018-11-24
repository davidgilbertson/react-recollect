import { isDebugOn } from './debug';
import {
  decorateWithPathAndProxy,
  makePath,
  makePathUserFriendly,
  makeUserFriendlyPath,
} from './general';
import { isProxyMuted } from './proxy';
import { getCurrentComponent } from './collect';
import { addListener, notifyByPath } from './updating';
import { updateStoreAtPath } from './store';

// TODO (davidg): share this with debug.js but I'm having trouble with circular references.
// Time to switch to Rollup or Webpack. Also does React export canUseDOM?
// Also this is only a function so it's executed after the module loads so the tests pass.
// If I'm importing this then I can mock it in serverRendering.test.js and test both cases
const isInBrowser = () => typeof window !== 'undefined';

const proxyHandler = {
  get(target, prop) {
    if (
      !isInBrowser() ||
      isProxyMuted() ||
      !getCurrentComponent() ||
      typeof prop === 'symbol' ||
      // TODO (davidg): 'constructor' is reserved, what's the other reserved one?
      prop === 'constructor'
    ) {
      return Reflect.get(target, prop);
    }

    if (isDebugOn()) {
      console.info(`GET component:  <${getCurrentComponent()._name}>`);
      console.info('GET property:  ', makeUserFriendlyPath(target, prop));
    }

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
    if (isProxyMuted() || !isInBrowser()) return Reflect.has(target, prop);
    // has() also gets called when looping over an array. We don't care about that
    if (!Array.isArray(target)) {
      if (isDebugOn()) {
        console.info(`GET component:  <${getCurrentComponent()._name}>`);
        console.info('GET property:  ', makeUserFriendlyPath(target, prop));
      }

      addListener(target, prop);
    }

    return Reflect.has(target, prop);
  },

  set(target, prop, value) {
    if (isProxyMuted() || !isInBrowser()) return Reflect.set(target, prop, value);

    const path = makePath(target, prop);

    // Add paths to this new value
    const newProxiedValue = decorateWithPathAndProxy(value, path);

    if (isDebugOn()) {
      console.info('SET property: ', makePathUserFriendly(path));
      console.info('SET from:     ', target[prop]);
      console.info('SET to:       ', newProxiedValue);
    }

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
    if (isProxyMuted() || !isInBrowser()) return Reflect.deleteProperty(target, prop);

    if (isDebugOn()) {
      console.info('DELETE property: ', makeUserFriendlyPath(target, prop));
    }

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
