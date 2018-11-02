import React from 'react';
let DEBUG = localStorage.getItem('RECOLLECT__DEBUG') || 'off';
const log = new Proxy(console, {
  get(target, prop) {
    // This means the line number for the log is where it was called, not here.
    if (DEBUG === 'on') return Reflect.get(target, prop);
    return () => {};
  }

}); // Lot's of globals here, break out into modules

let currentComponent;
let listeners = [];
const manualListeners = [];

const isObject = item => item && typeof item === 'object' && item.constructor === Object;

const addListener = (target, prop) => {
  if (!currentComponent) return; // Perhaps this could be more efficient than looping over every listener
  // for every get. BUT, it will loop ~1,000 items in 0.01ms so is very likely to be
  // nothing compared to updating the DOM

  const existingListener = listeners.some(listener => listener.component === currentComponent && listener.target === target && listener.prop === prop);

  if (!existingListener) {
    listeners.push({
      component: currentComponent,
      target,
      prop
    });
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

const notifyListeners = (target, prop, value) => {
  listeners.forEach(listener => {
    if (listener.prop === prop && listener.target === target) {
      log.info(`UPDATE <${listener.component._name}>:`);
      log.info('UPDATE prop:', prop);
      log.info('UPDATE new value:', value);
      log.info('UPDATE target:', target);
      listener.component.forceUpdate();
    }
  });
  manualListeners.forEach(cb => cb(store));
};

const proxyHandler = {
  get(target, prop) {
    if (Array.isArray(target)) {
      // If the TARGET is an array, e.g. if a component
      // checks someArray.length OR uses someArray.forEach() or .map() or .reduce(), etc.
      // Then it needs to be notified when the length changes
      addListener(target, 'length');
    } else {
      // otherwise, add a listener for whenever the target/prop is
      addListener(target, prop);
    }

    const result = Reflect.get(target, prop); // We need to recursively wrap arrays/objects in proxies

    if ((Array.isArray(result) || isObject(result)) && !isProxy(result)) {
      return createProxy(result, proxyHandler);
    } else {
      return result;
    }
  },

  has(target, prop) {
    // has() gets called when looping over an array. We don't care about that
    if (!Array.isArray(target)) {
      log.info('HAS target:', target);
      log.info('HAS prop:', prop);
      addListener(target, prop);
    }

    return Reflect.has(target, prop);
  },

  set(target, prop, value) {
    log.info('SET target:', target);
    log.info('SET prop:', prop);
    log.info('SET from:', target[prop]);
    log.info('SET to:', value);
    const result = Reflect.set(target, prop, value);
    notifyListeners(target, prop, value);
    return result;
  },

  deleteProperty(target, prop) {
    log.info('DELETE target:', target);
    log.info('DELETE prop:', prop);
    const result = Reflect.deleteProperty(target, prop);
    notifyListeners(target, prop);
    return result;
  }

};

const removeListenersForComponent = component => {
  listeners = listeners.filter(listener => listener.component !== component);
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
      return React.createElement(ComponentToWrap, this.props);
    }

  }

  WrappedComponent.displayName = `Collected(${componentName})`;
  return WrappedComponent;
};
export const store = createProxy({}, proxyHandler);
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
  }
};