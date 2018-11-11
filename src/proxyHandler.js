import { log } from './logging';
import {
  decorateWithPathAndProxy,
  makePath,
} from './general';
import { isProxyMuted } from './proxy';
import { getCurrentComponent } from './collect';
import { addListener, notifyByPath } from './updating';
import { updateStoreAtPath } from './store';

const proxyHandler = {
  get(target, prop) {
    if (
      isProxyMuted() ||
      !getCurrentComponent() ||
      typeof prop === 'symbol' ||
      // TODO (davidg): 'constructor' is reserved, what's the other reserved one?
      prop === 'constructor'
    ) {
      return Reflect.get(target, prop);
    }

    log.info(`---- GET ----`);
    log.info('GET component:', getCurrentComponent()._name);
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

    // Add paths to this new value
    const newProxiedValue = decorateWithPathAndProxy(value, path);

    log.info(`---- SET ----`);
    log.info('SET target:', target);
    log.info('SET prop:', prop);
    log.info('SET from:', target[prop]);
    log.info('SET to:', newProxiedValue);

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
