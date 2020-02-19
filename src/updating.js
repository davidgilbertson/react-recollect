import { getStore, setNextStore, setStore } from 'src/store';

import { debug } from 'src/shared/debug';
import {
  addManualListener,
  getListeners,
  getManualListeners,
} from 'src/shared/state';
import { PROP_PATH_SEP } from 'src/shared/constants';

/**
 * Add a callback to be called every time the store changes
 * @param cb
 */
export const afterChange = cb => {
  addManualListener(cb);
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

      debug(() => {
        console.groupCollapsed(`QUEUE UPDATE:  <${component._name}>`);
        console.info(`Changed property:   ${userFriendlyPropPath}`);
        console.groupEnd();
      });

      // TODO (davidg): could I push these to an array, then wait a tick and flush it?
      //  This would require major changes to the prev/next store logic.
      component.update(newStore);
    });
  }

  const oldStore = { ...getStore() };

  setStore(newStore);

  // In addition to calling .update() on components, we also trigger any manual listeners.
  // E.g. something registered with afterEach()
  getManualListeners().forEach(cb =>
    cb({
      store: newStore,
      propPath: userFriendlyPropPath,
      prevStore: oldStore,
      components: updatedComponents,
    })
  );
};

/**
 * Updates any component listening to:
 * - the exact propPath that has been changed. E.g. store.tasks.2
 * - a path further up the object tree. E.g. store.tasks - this is because a component in an array
 *   will typically get its values from its parent component. Not directly from the store
 *   being made available by collect()
 * - a path further down the object tree. E.g. store.tasks.2.name
 * @param {Object} props
 * @param {Array<*>} props.path - The path of the prop that changed
 * @param {Object} props.newStore - The next version of the store
 */
export const notifyByPath = ({ path, newStore }) => {
  let componentsToUpdate = [];
  const pathString = path.join(PROP_PATH_SEP);
  const listeners = getListeners();

  Object.entries(listeners).forEach(([listenerPath, components]) => {
    if (
      pathString === listenerPath || // direct match
      pathString.startsWith(`${listenerPath}${PROP_PATH_SEP}`) || // listener for parent pathString
      listenerPath.startsWith(`${pathString}${PROP_PATH_SEP}`) // listener for child path
    ) {
      componentsToUpdate = componentsToUpdate.concat(components);
    }
  });

  updateComponents({
    components: componentsToUpdate,
    path,
    newStore,
  });
};

// TODO (davidg): this borderline belongs in `state.js`
export const removeListenersForComponent = componentToRemove => {
  const listeners = getListeners();

  Object.entries(listeners).forEach(([listenerPath, components]) => {
    listeners[listenerPath] = components.filter(
      existingComponent => existingComponent !== componentToRemove
    );
  });
};
