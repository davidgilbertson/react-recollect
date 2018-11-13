import { getCurrentComponent } from './collect';
import { makePath } from './general';
import { log } from './logging';
import { getStore, setNextStore, setStore } from './store';

let listeners = {
  store: [],
};

const manualListeners = [];

export const getListeners = () => listeners;

export const addListener = (target, prop) => {
  if (!getCurrentComponent()) return;

  const path = makePath(target, prop);

  if (listeners[path]) {
    // TODO (davidg): consider Set or WeakSet instead of array? Easier to delete a component?
    // And no need to check for duplicates?
    listeners[path].push(getCurrentComponent());
  } else {
    listeners[path] = [getCurrentComponent()];
  }
};

export const afterChange = cb => {
  manualListeners.push(cb);
};

// TODO (davidg): remember why I can't batch updates. It was something to do with a component
// only listening on one prop, so not seeing changes to other props. See scatter-bar checking for
// if (!store.stories || !store.currentStoryIndex) return null. But I forget why exactly. Write
// a test for this scenario

const updateComponents = ({ components, path, newStore }) => {
  // This is for other components that might render as a result of these updates.
  setNextStore(newStore);

  // components can have duplicates, so take care to only update once each.
  const updated = [];

  if (components) {
    components.forEach(component => {
      if (updated.includes(component)) return;
      updated.push(component);

      log.info(`---- UPDATE ----`);
      log.info(`UPDATE <${component._name}>:`);
      log.info(`UPDATE path: ${path}`);

      component.update(newStore);
    });
  }

  const oldStore = Object.assign({}, getStore());

  setStore(newStore);

  // pass the path too, just useful for testing/debugging
  manualListeners.forEach(cb => cb(newStore, path, updated, oldStore));
};

/**
 * Updates any component listening to:
 * - the exact propPath that has been changed. E.g. store.tasks.2
 * - a path further up the object tree. E.g. store.tasks
 * - a path further down the object tree. E.g. store.tasks.2.name (only when
 * @param {object} props
 * @param {string} props.path - The path of the prop that changed
 * @param {object} props.newStore - The next version of the store
 */
export const notifyByPath = ({ path, newStore }) => {
  let components = [];

  for (const listenerPath in listeners) {
    if (
      path === listenerPath ||
      path.startsWith(`${listenerPath}.`) ||
      listenerPath.startsWith(`${path}.`) // TODO (davidg): this is wasteful a lot of the time
    ) {
      components = components.concat(listeners[listenerPath]);
    }
  }

  updateComponents({
    components,
    path,
    newStore,
  });
};

export const removeListenersForComponent = component => {
  for (const path in listeners) {
    listeners[path] = listeners[path].filter(listeningComponent => listeningComponent !== component);
  }
};
