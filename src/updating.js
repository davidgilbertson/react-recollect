import { debug } from 'src/shared/debug';
import state from 'src/shared/state';
import * as paths from 'src/shared/paths';
import * as utils from 'src/shared/utils';
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

  state.proxyIsMuted = true;
  // TODO (davidg): rename to prevStore/store
  utils.replaceObject(state.store, state.nextStore);
  state.proxyIsMuted = false;
};

/**
 * Updates any component listening to:
 * - the exact propPath that has been changed. E.g. tasks.2
 * - a path further up the object tree. E.g. store.tasks - this is because a component in an array
 *   will typically get its values from its parent component. Not directly from the store
 *   being made available by collect()
 * - a path further down the object tree. E.g. store.tasks.2.name
 * @param {Array<*>} pathArray - The path of the prop that changed
 */
export const notifyByPath = pathArray => {
  let componentsToUpdate = [];
  const pathString = paths.makeInternalString(pathArray);
  const userFriendlyPropPath = paths.makeUserString(pathArray);

  queue.changedPaths.add(userFriendlyPropPath);

  Object.entries(state.listeners).forEach(([listenerPath, components]) => {
    if (
      listenerPath === '' || // listening directly to the store object
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
