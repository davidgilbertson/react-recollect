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

/** @type {{components: Map<CollectorComponent, Set<string>>, changedPaths: Set<string>, timeoutPending: boolean}} */
const queue = {
  components: new Map(),
  changedPaths: new Set(),
  timeoutPending: false,
};

const flushUpdates = () => {
  queue.timeoutPending = false;

  queue.components.forEach((propsUpdated, component) => {
    debug(() => {
      console.groupCollapsed(`UPDATE:  <${component._name}>`);
      console.info('Changed properties:', Array.from(propsUpdated));
      console.groupEnd();
    });

    component.update();
  });

  state.manualListeners.forEach(cb =>
    cb({
      changedProps: Array.from(queue.changedPaths),
      renderedComponents: Array.from(queue.components.keys()),
      prevStore: state.store,
      store: state.nextStore,
    })
  );

  queue.components.clear();
  queue.changedPaths.clear();

  collapseStore();
};

/**
 * Updates any component listening to:
 * - the exact propPath that has been changed. E.g. tasks.2
 * - a path further up the object tree. E.g. store.tasks - this is because a component in an array
 *   will typically get its values from its parent component. Not directly from the store
 *   being made available by collect()
 * - a path further down the object tree. E.g. store.tasks.2.name
 * @param {Array<*>} path - The path of the prop that changed
 */
export const notifyByPath = path => {
  let componentsToUpdate = [];
  const pathString = path.slice(1).join(PROP_PATH_SEP);

  const userFriendlyPropPath = path.slice(1).join('.');
  queue.changedPaths.add(userFriendlyPropPath);

  Object.entries(state.listeners).forEach(([listenerPath, components]) => {
    if (
      pathString === listenerPath || // direct match
      pathString.startsWith(`${listenerPath}${PROP_PATH_SEP}`) || // listener for parent pathString
      listenerPath.startsWith(`${pathString}${PROP_PATH_SEP}`) // listener for child path
    ) {
      componentsToUpdate = componentsToUpdate.concat(components);

      components.forEach(component => {
        const propsUpdated = queue.components.get(component) || new Set();
        propsUpdated.add(userFriendlyPropPath);
        queue.components.set(component, propsUpdated);
      });
    }
  });

  if (state.isBatchUpdating) {
    if (!queue.timeoutPending) {
      queue.timeoutPending = true;
      setTimeout(flushUpdates);
    }
  } else {
    flushUpdates();
  }
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
