import { getCurrentComponent } from './collect';
import { makePath } from './general';
import { log } from './logging';
import { setStore } from './store';

let listeners = {
  store: [],
};

const manualListeners = [];

export const getListeners = () => listeners;

export const addListener = (target, prop) => {
  if (!getCurrentComponent()) return;

  const path = makePath(target, prop);

  if (listeners[path]) {
    // TODO (davidg): consider set or WeakSet instead of array? Easier to delete a component?
    // And no need to check for duplicates?
    listeners[path].push(getCurrentComponent());
  } else {
    listeners[path] = [getCurrentComponent()];
  }
};

export const afterChange = cb => {
  manualListeners.push(cb);
};

export const updateComponents = ({ components, path, newStore }) => {
  if (!components) return;

  // components can have duplicates, so take care to only update once each.
  const updated = [];

  components.forEach(component => {
    if (updated.includes(component)) return;
    updated.push(component);

    log.info(`---- UPDATE ----`);
    log.info(`UPDATE <${component._name}>:`);
    log.info(`UPDATE path: ${path}`);

    component.update(newStore);
  });
};

export const notifyByPath = ({ path, newStore }) => {
  let components = [];

  for (const listenerPath in listeners) {
    if (path === listenerPath || path.startsWith(`${listenerPath}.`)) {
      components = components.concat(listeners[listenerPath]);
    }
  }

  updateComponents({
    components,
    path,
    newStore,
  });

  // store = newStore;
  setStore(newStore);
  manualListeners.forEach(cb => cb(newStore, path));
};

export const notifyByPathStart = ({ parentPath, newStore }) => {
  let components = [];

  for (const listenerPath in listeners) {
    if (listenerPath.startsWith(`${parentPath}.`)) {
      components = components.concat(listeners[listenerPath]);
    }
  }

  updateComponents({
    components,
    path: parentPath,
    newStore,
  });

  // store = newStore;
  setStore(newStore);
  manualListeners.forEach(cb => cb(newStore, parentPath));
};

export const removeListenersForComponent = component => {
  for (const path in listeners) {
    listeners[path] = listeners[path].filter(listeningComponent => listeningComponent !== component);
  }
};
