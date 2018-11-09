"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.collect = exports.store = exports.afterChange = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

var DEBUG = localStorage.getItem('RECOLLECT__DEBUG') || 'off';
var PATH_PROP = Symbol('path'); // TODO (davidg): symbols mean I can't define the path as a string easily
// const PATH_PROP = '__RR_PATH_PROP';

var SEP = '.';
var muteProxy = false;
var rawStore = {};
var log = new Proxy(console, {
  get: function get(target, prop) {
    // This means the line number for the log is where it was called, not here.
    if (DEBUG === 'on') return Reflect.get(target, prop);
    return function () {};
  }
}); // Lot's of globals here, break out into modules

var currentComponent;
var listeners = {
  store: []
};
var manualListeners = [];

var isObject = function isObject(item) {
  return item && _typeof(item) === 'object' && item.constructor === Object;
};

var canBeProxied = function canBeProxied(item) {
  return (isObject(item) || Array.isArray(item)) && !isProxy(item);
};

var addPathProp = function addPathProp(item, value) {
  Object.defineProperty(item, PATH_PROP, {
    value: value,
    writable: true // paths can be updated. E.g. store.tasks.2 could become store.tasks.1

  });
}; // TODO (davidg): This risks collisions if a user's property name contains whatever
// my separator string is.


var makePath = function makePath(target, prop) {
  return [target[PATH_PROP], prop].join(SEP);
};

var addListener = function addListener(target, prop) {
  if (!currentComponent) return;
  var path = makePath(target, prop);

  if (listeners[path]) {
    // TODO (davidg): consider set or WeakSet instead of array? Easier to delete a component?
    // And no need to check for duplicates?
    listeners[path].push(currentComponent);
  } else {
    listeners[path] = [currentComponent];
  }
};

var afterChange = function afterChange(cb) {
  manualListeners.push(cb);
};

exports.afterChange = afterChange;
var proxies = new WeakSet();

var createProxy = function createProxy(obj, handler) {
  // TODO (davidg): let this function add in the handler
  var proxy = new Proxy(obj, handler);
  proxies.add(proxy);
  return proxy;
};

var isProxy = function isProxy(obj) {
  return proxies.has(obj);
};

var updateComponents = function updateComponents(_ref) {
  var components = _ref.components,
      path = _ref.path,
      newStore = _ref.newStore;
  if (!components) return; // components can have duplicates, so take care to only update once each.

  var updated = [];
  components.forEach(function (component) {
    if (updated.includes(component)) return;
    updated.push(component);
    log.info("---- UPDATE ----");
    log.info("UPDATE <".concat(component._name, ">:"));
    log.info("UPDATE path: ".concat(path));
    component.setState({
      store: newStore
    });
  });
};

var notifyByPath = function notifyByPath(_ref2) {
  var path = _ref2.path,
      newStore = _ref2.newStore;
  var components = [];

  for (var listenerPath in listeners) {
    if (path === listenerPath || path.startsWith("".concat(listenerPath, "."))) {
      components = components.concat(listeners[listenerPath]);
    }
  }

  updateComponents({
    components: components,
    path: path,
    newStore: newStore
  });
  exports.store = store = newStore;
  manualListeners.forEach(function (cb) {
    return cb(store, path);
  });
};

var notifyByPathStart = function notifyByPathStart(_ref3) {
  var parentPath = _ref3.parentPath,
      newStore = _ref3.newStore;
  var components = [];

  for (var listenerPath in listeners) {
    if (listenerPath.startsWith("".concat(parentPath, "."))) {
      components = components.concat(listeners[listenerPath]);
    }
  }

  updateComponents({
    components: components,
    path: parentPath,
    newStore: newStore
  });
  exports.store = store = newStore;
  manualListeners.forEach(function (cb) {
    return cb(store, parentPath);
  });
};

var decorateWithPath = function decorateWithPath(item, path) {
  if (isObject(item) || Array.isArray(item)) {
    if (item[PATH_PROP] === undefined) addPathProp(item, path);

    if (Array.isArray(item)) {
      item.forEach(function (itemEntry, i) {
        decorateWithPath(itemEntry, "".concat(path, ".").concat(i));
      });
      return;
    }

    Object.entries(item).forEach(function (_ref4) {
      var _ref5 = _slicedToArray(_ref4, 2),
          prop = _ref5[0],
          value = _ref5[1];

      decorateWithPath(value, "".concat(path, ".").concat(prop));
    });
  }
}; // Thanks to https://github.com/debitoor/dot-prop-immutable


var updateStoreAtPath = function updateStoreAtPath(_ref6) {
  var originalStore = _ref6.store,
      path = _ref6.path,
      value = _ref6.value,
      deleteItem = _ref6.deleteItem;
  muteProxy = true; // don't need to keep logging gets.

  var propArray = path.split(SEP);
  propArray.shift(); // we don't need 'store'.

  var update = function update(target, i) {
    if (i === propArray.length) return value;
    var isLastProp = i === propArray.length - 1;
    var thisProp = propArray[i];
    var targetClone; // We'll be cloning proxied objects with non-enumerable props
    // So we need to add these things back after cloning

    if (Array.isArray(target)) {
      targetClone = createProxy(target.slice(), proxyHandler);
      addPathProp(targetClone, target[PATH_PROP]); // If this is adding something to an array

      if (isLastProp && thisProp >= target.length) {
        // const isObjectOrArray = Array.isArray(value) || isObject(value);
        // targetClone[thisProp] = isObjectOrArray ? createProxy(value, proxyHandler) : value;
        targetClone[thisProp] = createProxy(value, proxyHandler); // TODO (davidg): add path?

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

    var next = target[thisProp] === undefined ? {} : target[thisProp];
    targetClone[thisProp] = update(next, i + 1);
    return targetClone;
  };

  var newStore = update(originalStore, 0);
  addPathProp(newStore, 'store');
  muteProxy = false; // The clone of the top level won't be a proxy object
  // TODO (davidg): actually newStore will already be a proxy, no?

  if (isProxy(newStore)) {
    return newStore;
  }

  console.log('Well this is unexpected, the store is not a proxy?');
  return createProxy(newStore, proxyHandler);
};

var proxyHandler = {
  get: function get(target, prop) {
    if (muteProxy) return Reflect.get(target, prop); // This will actually be called when reading PATH_PROP (so meta). Don't add a listener

    if (_typeof(prop) === 'symbol') return Reflect.get(target, prop); // TODO (davidg): 'constructor' is reserved, what's the other reserved one?

    if (prop === 'constructor') return Reflect.get(target, prop);
    log.info("---- GET ----");
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

    return Reflect.get(target, prop);
  },
  has: function has(target, prop) {
    if (muteProxy) return Reflect.has(target, prop); // has() also gets called when looping over an array. We don't care about that

    if (!Array.isArray(target)) {
      log.info("---- HAS ----");
      log.info('HAS target:', target);
      log.info('HAS prop:', prop);
      addListener(target, prop);
    }

    return Reflect.has(target, prop);
  },
  set: function set(target, prop, value) {
    if (muteProxy) return Reflect.set(target, prop, value);
    var path = makePath(target, prop);
    var valueToSet = value; // Add paths to this new value

    decorateWithPath(value, path);
    log.info("---- SET ----");
    log.info('SET target:', target);
    log.info('SET prop:', prop);
    log.info('SET from:', target[prop]);
    log.info('SET to:', value);

    if (Array.isArray(target)) {
      // Scenarios:
      // - target is array, prop is a number bigger than the array (adding an item, should update store by paths matching the parent)
      // - target is array, prop is length. Usually fired after some other update.
      // - target is array, prop is existing index, existing value is object. Then update all listeners for any properties on the object being replaced (by matching on the start of the path)
      if (prop === 'length') {
        if (value === 0) {
          // a special case of a user doing arr.length = 0; to empty an array
          valueToSet = [];
        } else {
          // otherwise probably fired by the JS engine after some other array change
          return true;
        }
      }

      if (!Number.isNaN(prop)) {
        var _newStore = updateStoreAtPath({
          store: store,
          path: path,
          value: value
        }); // We're updating an object, to a new object
        // Now, we want anything that listens to any prop of the object in the array that is changing
        // to be updated


        if (isObject(target[prop]) && isObject(value) || Number(prop) >= target.length) {
          notifyByPathStart({
            parentPath: target[PATH_PROP],
            newStore: _newStore
          });
          return true;
        }
      }
    } // TODO (davidg): this actually needs to be a 'deep proxy' and deep path setting as well
    // whenever the value is an array or object.


    if (Array.isArray(value)) {
      // We are CREATING or REPLACING an array, so wrap it, and its items, in proxies
      // TODO: I can do this in `decorateWithPath` to save looping through twice
      var wrappedItems = value.map(function (item, i) {
        // For example, there may have been an existing array of proxied objects,
        // then some new, non-proxied objects were added. We'll need to wrap some but not
        // others
        addPathProp(item, "".concat(path, ".").concat(i)); // We might be updating the path for this one

        return canBeProxied(item) ? createProxy(item, proxyHandler) : item;
      });
      valueToSet = isProxy(wrappedItems) ? wrappedItems : createProxy(wrappedItems, proxyHandler); // We just created a new array, so we need to set this, again. Could be done better.

      addPathProp(valueToSet, path);
    }

    var newStore = updateStoreAtPath({
      store: store,
      path: path,
      value: valueToSet
    });
    notifyByPath({
      path: path,
      newStore: newStore
    });
    return true;
  },
  deleteProperty: function deleteProperty(target, prop) {
    if (muteProxy) return Reflect.deleteProperty(target, prop);
    log.info("---- DELETE ----");
    log.info('DELETE target:', target);
    log.info('DELETE prop:', prop);
    var path = makePath(target, prop);
    var newStore = updateStoreAtPath({
      store: store,
      path: path,
      deleteItem: true
    });
    notifyByPath({
      path: path,
      newStore: newStore
    });
    return true;
  }
};

var removeListenersForComponent = function removeListenersForComponent(component) {
  for (var path in listeners) {
    listeners[path] = listeners[path].filter(function (listeningComponent) {
      return listeningComponent !== component;
    });
  }
};

var startRecordingGetsForComponent = function startRecordingGetsForComponent(component) {
  removeListenersForComponent(component);
  currentComponent = component;
};

var stopRecordingGetsForComponent = function stopRecordingGetsForComponent() {
  currentComponent = null;
};

addPathProp(rawStore, 'store');
var store = createProxy(rawStore, proxyHandler);
exports.store = store;

var collect = function collect(ComponentToWrap) {
  var componentName = ComponentToWrap.displayName || ComponentToWrap.name || 'NamelessComponent';

  var WrappedComponent =
  /*#__PURE__*/
  function (_React$PureComponent) {
    _inherits(WrappedComponent, _React$PureComponent);

    function WrappedComponent() {
      var _this;

      _classCallCheck(this, WrappedComponent);

      _this = _possibleConstructorReturn(this, _getPrototypeOf(WrappedComponent).call(this));
      _this.state = {
        store: store
      }; // whatever the current state is.

      _this._name = componentName;
      return _this;
    } // componentDidMount() {
    //   stopRecordingGetsForComponent();
    // }


    _createClass(WrappedComponent, [{
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        removeListenersForComponent(this);
      }
    }, {
      key: "render",
      value: function render() {
        startRecordingGetsForComponent(this);
        setTimeout(stopRecordingGetsForComponent);
        return _react.default.createElement(ComponentToWrap, _extends({}, this.props, {
          store: this.state.store
        }));
      }
    }]);

    return WrappedComponent;
  }(_react.default.PureComponent);

  WrappedComponent.displayName = "Collected(".concat(componentName, ")");
  return WrappedComponent;
};

exports.collect = collect;
window.__RR__ = {
  getStore: function getStore() {
    return store;
  },
  getListeners: function getListeners() {
    return listeners;
  },
  debugOn: function debugOn() {
    DEBUG = 'on';
    localStorage.setItem('RECOLLECT__DEBUG', DEBUG);
  },
  debugOff: function debugOff() {
    DEBUG = 'off';
    localStorage.setItem('RECOLLECT__DEBUG', DEBUG);
  }
};