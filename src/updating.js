import { getCurrentComponent } from './collect';
import { makePath } from './general';
import { isDebugOn } from './debug';
import { getStore, setNextStore, setStore } from './store';

/**
 * To convert the path array to a string for the listener keys
 * Use a crazy separator. If the separator was a '.', and the user had a prop with a dot in it,
 * then it could cause false matches in the updated logic.
 * @type {string}
 */
const PROP_PATH_SEP = '~~~';

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

  // We use a string instead of an array because it's much easier to match
  const pathString = makePath(target, prop).join(PROP_PATH_SEP);

  // TODO (davidg): consider Map instead of array? Easier to delete a component?
  //  could be like this, but as a Map
  // const listeners = {
  //   'path~~~as~~~string': {
  //     pathArray: ['path', 'as', 'string'],
  //     components: [],
  //   }
  // }


  if (listeners[pathString]) {
    listeners[pathString].push(getCurrentComponent());
  } else {
    listeners[pathString] = [getCurrentComponent()];
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
 * // TODO (davidg): bad name (or architecture?), this triggers afterChange
 * @param {Object} props
 * @param {Array<Object>} props.components - the components to update
 * @param {Array<*>} props.path - the property path that triggered this change
 * @param {Object} props.newStore - the next version of the store, with updates applied
 */
const updateComponents = ({ components, path, newStore }) => {
  // This is for other components that might render as a result of these updates.
  setNextStore(newStore);

  // components can have duplicates, so take care to only update once each.
  const updatedComponents = [];
  const userFriendlyPropPath = path.join('.');

  if (components) {
    components.forEach(component => {
      if (updatedComponents.includes(component)) return;
      updatedComponents.push(component);

      if (isDebugOn()) {
        console.groupCollapsed(`QUEUE UPDATE:  <${component._name}>`);
        console.info(`Changed property:   ${userFriendlyPropPath}`);
        console.groupEnd();
      }

      // TODO (davidg): could I push these to an array, then wait a tick and flush it?
      //  This would require major changes to the prev/next store logic.
      component.update(newStore);
    });
  }

  const oldStore = Object.assign({}, getStore());

  setStore(newStore);

  // In addition to calling .update() on components, we also trigger any manual listeners.
  // E.g. something registered with afterEach()
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
 * - a path further up the object tree. E.g. store.tasks - this is because a component in an array
 *   will typically get its values from its parent component. Not directly from the store
 *   being made available by collect()
 * - a path further down the object tree. E.g. store.tasks.2.name (only when
 * @param {Object} props
 * @param {Array<*>} props.path - The path of the prop that changed
 * @param {Object} props.newStore - The next version of the store
 */
export const notifyByPath = ({ path, newStore }) => {
  let components = [];
  const pathString = path.join(PROP_PATH_SEP);

  for (const listenerPath in listeners) {
    if (
      pathString === listenerPath || // direct match
      pathString.startsWith(`${listenerPath}${PROP_PATH_SEP}`) || // listener for parent pathString
      listenerPath.startsWith(`${pathString}${PROP_PATH_SEP}`) // listener for child path
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
