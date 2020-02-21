import { collapseStore } from 'src/store';

import { debug } from 'src/shared/debug';
import state from 'src/shared/state';
import { PROP_PATH_SEP } from 'src/shared/constants';

/**
 * Add a callback to be called every time the store changes
 * @param cb
 */
export const afterChange = cb => {
  state.manualListeners.push(cb);
};

// TODO (davidg): remember why I can't batch updates. It was something to do with a component
// only listening on one prop, so not seeing changes to other props. See scatter-bar checking for
// if (!store.stories || !store.currentStoryIndex) return null. But I forget why exactly. Write
// a test for this scenario

/**
 * Updates any component listening to:
 * - the exact propPath that has been changed. E.g. store.tasks.2
 * - a path further up the object tree. E.g. store.tasks - this is because a component in an array
 *   will typically get its values from its parent component. Not directly from the store
 *   being made available by collect()
 * - a path further down the object tree. E.g. store.tasks.2.name
 * @param {Array<*>} path - The path of the prop that changed
 */
export const notifyByPath = path => {
  let componentsToUpdate = [];
  const pathString = path.slice(1).join(PROP_PATH_SEP);

  Object.entries(state.listeners).forEach(([listenerPath, components]) => {
    if (
      pathString === listenerPath || // direct match
      pathString.startsWith(`${listenerPath}${PROP_PATH_SEP}`) || // listener for parent pathString
      listenerPath.startsWith(`${pathString}${PROP_PATH_SEP}`) // listener for child path
    ) {
      componentsToUpdate = componentsToUpdate.concat(components);
    }
  });

  // components can have duplicates, so take care to only update once each.
  const updatedComponents = [];
  const userFriendlyPropPath = path.slice(1).join('.');

  if (componentsToUpdate) {
    componentsToUpdate.forEach(component => {
      if (updatedComponents.includes(component)) return;
      updatedComponents.push(component);

      debug(() => {
        console.groupCollapsed(`QUEUE UPDATE:  <${component._name}>`);
        console.info(`Changed property:   ${userFriendlyPropPath}`);
        console.groupEnd();
      });

      // TODO (davidg): could I push these to an array, then wait a tick and flush it?
      //  This would require major changes to the prev/next store logic.
      component.update();
    });
  }

  // In addition to calling .update() on components, we also trigger
  // any manual listeners registered with afterEach()
  state.manualListeners.forEach(cb =>
    cb({
      store: state.nextStore,
      propPath: userFriendlyPropPath,
      prevStore: state.store,
      components: updatedComponents,
    })
  );

  collapseStore();
};

export const removeListenersForComponent = componentToRemove => {
  Object.entries(state.listeners).forEach(([listenerPath, components]) => {
    const filteredComponents = components.filter(
      existingComponent => existingComponent !== componentToRemove
    );

    if (filteredComponents.length) {
      state.listeners[listenerPath] = filteredComponents;
    } else {
      // If there's no components left, remove the path
      // For example, leaving a page will unmount a bunch of components
      delete state.listeners[listenerPath];
    }
  });
};
