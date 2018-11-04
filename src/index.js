import React from 'react';

let DEBUG = localStorage.getItem('RECOLLECT__DEBUG') || 'off';
// const PATH_PROP = Symbol('path'); // TODO (davidg): symbols mean I can't define the path as a string easily
const PATH_PROP = '__RR_PATH_PROP';

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

const addPathProp = (item, value) => {
  Object.defineProperty(item, PATH_PROP, { value });
};

const makePath = (target, prop) => `${target[PATH_PROP]}.${prop}`;

const addListener = (target, prop) => {
  if (!currentComponent) return;

  const path = makePath(target, prop);

  if (listeners[path]) {
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
  const proxy = new Proxy(obj, handler);
  proxies.add(proxy);
  return proxy;
};

const isProxy = obj => proxies.has(obj);

const updateComponents = ({ components, path, value }) => {
  if (!components) return;

  // components can have duplicates, so take care to only update once each.
  const updated = [];

  components.forEach(component => {
    if (updated.includes(component)) return;
    updated.push(component);

    log.info(`---- UPDATE ----`);
    log.info(`UPDATE <${component._name}>:`);
    log.info(`UPDATE path: ${path}`);
    log.info(`UPDATE value: ${value}`);

    // TODO (davidg): test out component.setState({})
    component.forceUpdate();
  });
};

const notifyByPath = ({ target, prop, value }) => {
  const path = makePath(target, prop);

  updateComponents({
    components: listeners[path],
    path,
    value,
  });

  manualListeners.forEach(cb => cb(store));
};

const notifyByPathStart = (parentPath, value) => {
  let components = [];

  for (const path in listeners) {
    if (path.startsWith(`${parentPath}.`)) {
      components = components.concat(listeners[path]);
    }
  }

  updateComponents({
    components,
    path: parentPath,
    value,
  });

  manualListeners.forEach(cb => cb(store));
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

const proxyHandler = {
  get(target, prop) {
    // This will actually be called when reading PATH_PROP (so meta). Don't add a listener
    if (prop === PATH_PROP) return Reflect.get(target, prop);

    // TODO (davidg): think about this. Is 'constructor' a valid prop name? How can I avoid it?
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

    const result = Reflect.get(target, prop);

    // We need to recursively wrap arrays/objects in proxies
    if ((Array.isArray(result) || isObject(result)) && !isProxy(result)) {
      return createProxy(result, proxyHandler);
    } else {
      return result;
    }
  },

  has(target, prop) {
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
    const path = makePath(target, prop);
    decorateWithPath(value, path);
    log.info(`---- SET ----`);
    log.info('SET target:', target);
    log.info('SET prop:', prop);
    log.info('SET from:', target[prop]);
    log.info('SET to:', value);

    // If
    // - the target is an Array, and
    // - the prop is a number,
    // - the result is an object
    // then we are replacing a whole array item. So, when notifying listeners, anything listening to changes
    // to that object (regardless of the prop) should get an update.
    if (
      Array.isArray(target) &&
      !Number.isNaN(prop) &&
      isObject(target[prop]) &&
      isObject(value)
    ) {
      const result = Reflect.set(target, prop, value);
      // Now, we want anything that listens to any prop of the object in the array that is changing
      // to be updated
      notifyByPathStart(path, value);

      return result;
    }

    // If the value is an array, wrap its items in proxies now
    // TODO: everything should be wrapped in a proxy when going in to the store, rather than when being read
    // I can do this in `decorateWithPath` to save looping through twice
    if (Array.isArray(value)) {
      const wrappedItems = value.map(item => {
        // For example, there may have been an existing array of proxied objects,
        // then some new, non-proxied objects were added. We'll need to wrap some but not
        // others
        return isProxy(item) ? item : createProxy(item, proxyHandler);
      });

      const wrappedArray = isProxy(wrappedItems) ? wrappedItems : createProxy(wrappedItems, proxyHandler);

      // We just created a new array, so we need to set this, again. Could be done better.
      addPathProp(wrappedArray, path);

      Reflect.set(target, prop, wrappedArray);

      notifyByPath({ target, prop, value: wrappedArray });

      return true;
    }

    const result = Reflect.set(target, prop, value);

    notifyByPath({ target, prop, value });

    return result;
  },

  deleteProperty(target, prop) {
    log.info(`---- DELETE ----`);
    log.info('DELETE target:', target);
    log.info('DELETE prop:', prop);

    const result = Reflect.deleteProperty(target, prop);

    notifyByPath({ target, prop });

    return result;
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

export const collect = ComponentToWrap => {
  const componentName = ComponentToWrap.displayName || ComponentToWrap.name || 'NamelessComponent';

  class WrappedComponent extends React.PureComponent {
    constructor() {
      super();
      this._name = componentName;
    }

    componentDidMount() {
      stopRecordingGetsForComponent();
    }

    componentWillUnmount() {
      removeListenersForComponent(this);
    }

    render() {
      startRecordingGetsForComponent(this);
      return <ComponentToWrap {...this.props} />;
    }
  }

  WrappedComponent.displayName = `Collected(${componentName})`;

  return WrappedComponent;
};

const rawStore = {};

addPathProp(rawStore, 'store');

export const store = createProxy(rawStore, proxyHandler);

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
