import { debug } from './shared/debug';
import state from './shared/state';
import * as paths from './shared/paths';
import * as utils from './shared/utils';
import { PROP_PATH_SEP } from './shared/constants';
import { CollectorComponent } from './types/collect';
import { AfterChangeEvent } from './types/updating';

/**
 * Add a callback to be called every time the store changes
 */
export const afterChange = (cb: (e: AfterChangeEvent) => void) => {
  state.manualListeners.push(cb);
};

type Queue = {
  components: Map<CollectorComponent, Set<string>>;
  changedPaths: Set<string>;
  timeoutPending: boolean;
};

const queue: Queue = {
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

  state.manualListeners.forEach((cb) =>
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
export const notifyByPath = (pathArray) => {
  const pathString = paths.makeInternalString(pathArray);
  const userFriendlyPropPath = paths.makeUserString(pathArray);

  queue.changedPaths.add(userFriendlyPropPath);

  state.listeners.forEach((components, listenerPath) => {
    if (
      listenerPath === '' || // listening directly to the store object
      pathString === listenerPath || // direct match
      pathString.startsWith(`${listenerPath}${PROP_PATH_SEP}`) || // listener for parent pathString
      listenerPath.startsWith(`${pathString}${PROP_PATH_SEP}`) // listener for child path
    ) {
      components.forEach((component) => {
        const propsUpdated = queue.components.get(component) || new Set();
        propsUpdated.add(userFriendlyPropPath);
        queue.components.set(component, propsUpdated);
      });
    }
  });

  if (state.isBatchUpdating) {
    if (!queue.timeoutPending) {
      queue.timeoutPending = true;
      // eslint-disable-next-line @typescript-eslint/no-implied-eval
      setTimeout(flushUpdates);
    }
  } else {
    flushUpdates();
  }
};

export const removeListenersForComponent = (componentToRemove) => {
  state.listeners.forEach((components, listenerPath) => {
    const filteredComponents = Array.from(components).filter(
      (existingComponent) => existingComponent !== componentToRemove
    );

    if (filteredComponents.length) {
      state.listeners.set(listenerPath, new Set(filteredComponents));
    } else {
      // If there are no components left listening, remove the path
      // For example, leaving a page will unmount a bunch of components
      state.listeners.delete(listenerPath);
    }
  });
};
