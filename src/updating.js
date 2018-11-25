import { getCurrentComponent } from './collect';
import { makePath, makePathUserFriendly } from './general';
import { isDebugOn } from './debug';
import { getStore, setNextStore, setStore } from './store';
import { PROP_PATH_SEP } from './constants';

let listeners = {
  store: [],
};

const manualListeners = [];

export const getListeners = () => listeners;

/**
 * Add a new listener to be notified when a particular value in the store changes
 * To be used when a component reads from a property
 * @param target - the Proxy target object
 * @param prop - the property of the target that was read
 */
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

/**
 * Add a callback to be called every time the store changes
 * @param cb
 */
export const afterChange = cb => {
  manualListeners.push(cb);
};

// TODO (davidg): remember why I can't batch updates. It was something to do with a component
// only listening on one prop, so not seeing changes to other props. See scatter-bar checking for
// if (!store.stories || !store.currentStoryIndex) return null. But I forget why exactly. Write
// a test for this scenario

/**
 *
 * @param {Object} props
 * @param {Object[]} props.components - the components to update
 * @param {string} props.path - the property path that triggered this change
 * @param {Object} props.newStore - the next version of the store, with updates applied
 */
const updateComponents = ({ components, path, newStore }) => {
  // This is for other components that might render as a result of these updates.
  setNextStore(newStore);

  // components can have duplicates, so take care to only update once each.
  const updatedComponents = [];
  const userFriendlyPropPath = makePathUserFriendly(path);

  if (components) {
    components.forEach(component => {
      if (updatedComponents.includes(component)) return;
      updatedComponents.push(component);

      if (isDebugOn()) {
        console.info(`UPDATE component:  <${component._name}>`);
        console.info(`UPDATE property:   ${userFriendlyPropPath}`);
      }

      component.update(newStore);
    });
  }

  const oldStore = Object.assign({}, getStore());

  setStore(newStore);

  manualListeners.forEach(cb => cb({
    store: newStore,
    propPath: userFriendlyPropPath,
    prevStore: oldStore,
    components: updatedComponents
  }));
};

/**
 * Updates any component listening to:
 * - the exact propPath that has been changed. E.g. store.tasks.2
 * - a path further up the object tree. E.g. store.tasks
 * - a path further down the object tree. E.g. store.tasks.2.name (only when
 * @param {Object} props
 * @param {string} props.path - The path of the prop that changed
 * @param {Object} props.newStore - The next version of the store
 */
export const notifyByPath = ({ path, newStore }) => {
  let components = [];

  for (const listenerPath in listeners) {
    if (
      path === listenerPath ||
      path.startsWith(`${listenerPath}${PROP_PATH_SEP}`) ||
      listenerPath.startsWith(`${path}${PROP_PATH_SEP}`) // TODO (davidg): this is wasteful a lot of the time
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
