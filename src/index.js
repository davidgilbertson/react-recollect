import React from 'react';

let DEBUG = localStorage.getItem('RECOLLECT__DEBUG') || 'off';
const PATH_PROP = Symbol('path'); // TODO (davidg): symbols mean I can't define the path as a string easily
// const PATH_PROP = '__RR_PATH_PROP';
const SEP = '.';

let muteProxy = false;
const rawStore = {};

const log = new Proxy(console, {
  get(target, prop) {
    // This means the line number for the log is where it was called, not here.
    if (DEBUG === 'on') return Reflect.get(target, prop);

    return () => {};
  },
});

// Lot's of globals here, break out into modules
let currentComponent;

let listeners = {
  store: [],
};

const manualListeners = [];

const isObject = item => item && typeof item === 'object' && item.constructor === Object;

const canBeProxied = item => (isObject(item) || Array.isArray(item)) && !isProxy(item);

const addPathProp = (item, value) => {
  Object.defineProperty(item, PATH_PROP, { value });
};

// TODO (davidg): This risks collisions if a user's property name contains whatever
// my separator string is.
const makePath = (target, prop) => [target[PATH_PROP], prop].join(SEP);

const addListener = (target, prop) => {
  if (!currentComponent) return;

  const path = makePath(target, prop);

  if (listeners[path]) {
    // TODO (davidg): consider set or WeakSet instead of array? Easier to delete a component?
    // And no need to check for duplicates?
    listeners[path].push(currentComponent);
  } else {
    listeners[path] = [currentComponent];
  }
};

export const afterChange = cb => {
  manualListeners.push(cb);
};

const proxies = new WeakSet();

const createProxy = (obj, handler) => {
  // TODO (davidg): let this function add in the handler
  const proxy = new Proxy(obj, handler);
  proxies.add(proxy);
  return proxy;
};

const isProxy = obj => proxies.has(obj);

const updateComponents = ({ components, path, newStore }) => {
  if (!components) return;

  // components can have duplicates, so take care to only update once each.
  const updated = [];

  components.forEach(component => {
    if (updated.includes(component)) return;
    updated.push(component);

    log.info(`---- UPDATE ----`);
    log.info(`UPDATE <${component._name}>:`);
    log.info(`UPDATE path: ${path}`);

    // TODO (davidg): pass in new store from other callers of updateComponents
    // TODO (davidg): component.setState(newStore); ??
    component.setState({...newStore});
  });
};

const notifyByPath = ({ path, newStore }) => {
  updateComponents({
    components: listeners[path],
    path,
    newStore,
  });

  store = newStore;
  manualListeners.forEach(cb => cb(store, path));
};

const notifyByPathStart = ({ parentPath, newStore }) => {
  let components = [];

  for (const path in listeners) {
    if (path.startsWith(`${parentPath}.`)) {
      components = components.concat(listeners[path]);
    }
  }

  updateComponents({
    components,
    path: parentPath,
    newStore,
  });

  store = newStore;
  manualListeners.forEach(cb => cb(store, parentPath));
};

const decorateWithPath = (item, path) => {
  if (isObject(item) || Array.isArray(item)) {
    if (item[PATH_PROP] === undefined) addPathProp(item, path);

    if (Array.isArray(item)) {
      item.forEach((itemEntry, i) => {
        decorateWithPath(itemEntry, `${path}.${i}`);
      });

      return;
    }

    Object.entries(item).forEach(([prop, value]) => {
      decorateWithPath(value, `${path}.${prop}`);
    });
  }
};

// Thanks to https://github.com/debitoor/dot-prop-immutable
const updateStoreAtPath = ({
  store: originalStore,
  path,
  value,
  deleteItem,
}) => {
  muteProxy = true; // don't need to keep logging gets.

  const propArray = path.split(SEP);
  propArray.shift(); // we don't need 'store'.

  const update = (target, i) => {
    if (i === propArray.length) return value;

    let thisProp = propArray[i];
    let targetClone;


    // We'll be cloning proxied objects with non-enumerable props
    // So we need to add these things back after cloning
    if (Array.isArray(target)) {
      targetClone = createProxy(target.slice(), proxyHandler);
      addPathProp(targetClone, target[PATH_PROP]);

      // If this is adding something to an array
      if (thisProp >= target.length) {
        // const isObjectOrArray = Array.isArray(value) || isObject(value);
        // targetClone[thisProp] = isObjectOrArray ? createProxy(value, proxyHandler) : value;
        targetClone[thisProp] = createProxy(value, proxyHandler);
        // TODO (davidg): add path?
        return targetClone;
      }
    } else {
      targetClone = Object.assign({}, target);
      if (isProxy(target) && !isProxy(targetClone)) {
        targetClone = createProxy(targetClone, proxyHandler);
      }
      addPathProp(targetClone, target[PATH_PROP]);
    }

    if (i === propArray.length - 1 && deleteItem) {
      delete targetClone[thisProp];
      return targetClone;
    }

    const next = target[thisProp] === undefined ? {} : target[thisProp];
    targetClone[thisProp] = update(next, i + 1);

    return targetClone;
  };

  const newStore = update(originalStore, 0);

  addPathProp(newStore, 'store');

  muteProxy = false;

  // The clone of the top level won't be a proxy object
  return isProxy(newStore) ? newStore : createProxy(newStore, proxyHandler);
};

const proxyHandler = {
  get(target, prop) {
    if (muteProxy) return Reflect.get(target, prop);
    // This will actually be called when reading PATH_PROP (so meta). Don't add a listener
    if (typeof prop === 'symbol') return Reflect.get(target, prop);

    // TODO (davidg): 'constructor' is reserved, what's the other reserved one?
    if (prop === 'constructor') return Reflect.get(target, prop);

    log.info(`---- GET ----`);
    log.info('GET component:', currentComponent ? currentComponent._name : 'none');
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

    // const result = Reflect.get(target, prop);

    // We need to recursively wrap arrays/objects in proxies
    // if ((Array.isArray(result) || isObject(result)) && !isProxy(result)) {
    //   return createProxy(result, proxyHandler);
    // } else {
    // }
    return Reflect.get(target, prop);
  },

  has(target, prop) {
    if (muteProxy) return Reflect.has(target, prop);
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
    if (muteProxy) return Reflect.set(target, prop, value);

    const path = makePath(target, prop);

    let valueToSet = value;

    // Add paths to this new value
    decorateWithPath(value, path);

    log.info(`---- SET ----`);
    log.info('SET target:', target);
    log.info('SET prop:', prop);
    log.info('SET from:', target[prop]);
    log.info('SET to:', value);

    if (Array.isArray(target)) {
      // Scenarios:
      // - target is array, prop is a number bigger than the array (adding an item, should update store by paths matching the parent)
      // - target is array, prop is length. Usually fired after some other update.
      // - target is array, prop is existing index, existing value is object. Then update all listeners for any properties on the object being replaced (by matching on the start of the path)
      if (prop === 'length') return true;

      // setting the length. TODO handle manual setting to zero in newStore
      // Ofter this is called automatically after updating an array.
      // return Reflect.set(target, prop, value);

      if (!Number.isNaN(prop)) {
        const newStore = updateStoreAtPath({ store, path, value });

        // We're updating an object, to a new object
        // Now, we want anything that listens to any prop of the object in the array that is changing
        // to be updated
        if (
          (isObject(target[prop]) && isObject(value)) ||
          Number(prop) >= target.length
        ) {
          notifyByPathStart({
            parentPath: target[PATH_PROP],
            newStore
          });

          return true;
        }
      }
    }

    if (Array.isArray(value)) {
      // We are CREATING or REPLACING an array, so wrap it, and its items, in proxies
      // TODO: I can do this in `decorateWithPath` to save looping through twice
      const wrappedItems = value.map(item => {
        // For example, there may have been an existing array of proxied objects,
        // then some new, non-proxied objects were added. We'll need to wrap some but not
        // others
        return canBeProxied(item) ? createProxy(item, proxyHandler) : item;
      });

      valueToSet = isProxy(wrappedItems) ? wrappedItems : createProxy(wrappedItems, proxyHandler);

      // We just created a new array, so we need to set this, again. Could be done better.
      addPathProp(valueToSet, path);
    }

    const newStore = updateStoreAtPath({
      store,
      path,
      value: valueToSet,
    });

    notifyByPath({
      path,
      newStore,
    });

    return true;
  },

  deleteProperty(target, prop) {
    if (muteProxy) return Reflect.deleteProperty(target, prop);

    log.info(`---- DELETE ----`);
    log.info('DELETE target:', target);
    log.info('DELETE prop:', prop);

    const path = makePath(target, prop);

    const newStore = updateStoreAtPath({
      store,
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

const removeListenersForComponent = component => {
  for (const path in listeners) {
    listeners[path] = listeners[path].filter(listeningComponent => listeningComponent !== component);
  }
};

const startRecordingGetsForComponent = component => {
  removeListenersForComponent(component);
  currentComponent = component;
};

const stopRecordingGetsForComponent = () => {
  currentComponent = null;
};

addPathProp(rawStore, 'store');

export let store = createProxy(rawStore, proxyHandler);

export const collect = ComponentToWrap => {
  const componentName = ComponentToWrap.displayName || ComponentToWrap.name || 'NamelessComponent';

  class WrappedComponent extends React.PureComponent {
    constructor() {
      super();
      this.state = store; // whatever the current state is.
      this._name = componentName;
    }

    // componentDidMount() {
    //   stopRecordingGetsForComponent();
    // }

    componentWillUnmount() {
      removeListenersForComponent(this);
    }

    render() {
      startRecordingGetsForComponent(this);

      setTimeout(stopRecordingGetsForComponent);

      return <ComponentToWrap {...this.props} store={this.state} />;
    }
  }

  WrappedComponent.displayName = `Collected(${componentName})`;

  return WrappedComponent;
};

window.__RR__ = {
  getStore: () => store,
  getListeners: () => listeners,
  debugOn: () => {
    DEBUG = 'on';
    localStorage.setItem('RECOLLECT__DEBUG', DEBUG);
  },
  debugOff: () => {
    DEBUG = 'off';
    localStorage.setItem('RECOLLECT__DEBUG', DEBUG);
  },
};
