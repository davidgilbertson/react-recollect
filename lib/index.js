"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.store = exports.collect = exports.afterChange = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var addPathProp = function addPathProp(item, value) {
  Object.defineProperty(item, PATH_PROP, {
    value: value
  });
};

var makePath = function makePath(target, prop) {
  return "".concat(target[PATH_PROP], ".").concat(prop);
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
      value = _ref.value;
  if (!components) return; // components can have duplicates, so take care to only update once each.

  var updated = [];
  components.forEach(function (component) {
    if (updated.includes(component)) return;
    updated.push(component);
    log.info("---- UPDATE ----");
    log.info("UPDATE <".concat(component._name, ">:"));
    log.info("UPDATE path: ".concat(path));
    log.info("UPDATE value: ".concat(value)); // TODO (davidg): test out component.setState({})

    component.forceUpdate();
  });
};

var notifyByPath = function notifyByPath(_ref2) {
  var target = _ref2.target,
      prop = _ref2.prop,
      value = _ref2.value;
  var path = makePath(target, prop);
  updateComponents({
    components: listeners[path],
    path: path,
    value: value
  });
  manualListeners.forEach(function (cb) {
    return cb(store);
  });
};

var notifyByPathStart = function notifyByPathStart(parentPath, value) {
  var components = [];

  for (var path in listeners) {
    if (path.startsWith("".concat(parentPath, "."))) {
      components = components.concat(listeners[path]);
    }
  }

  updateComponents({
    components: components,
    path: parentPath,
    value: value
  });
  manualListeners.forEach(function (cb) {
    return cb(store);
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

    Object.entries(item).forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
          prop = _ref4[0],
          value = _ref4[1];

      decorateWithPath(value, "".concat(path, ".").concat(prop));
    });
  }
};

var proxyHandler = {
  get: function get(target, prop) {
    // This will actually be called when reading PATH_PROP (so meta). Don't add a listener
    // if (prop === PATH_PROP) return Reflect.get(target, prop);
    if (_typeof(prop) === 'symbol') return Reflect.get(target, prop); // TODO (davidg): think about this. Is 'constructor' a valid prop name? How can I avoid it?

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

    var result = Reflect.get(target, prop); // We need to recursively wrap arrays/objects in proxies

    if ((Array.isArray(result) || isObject(result)) && !isProxy(result)) {
      return createProxy(result, proxyHandler);
    } else {
      return result;
    }
  },
  has: function has(target, prop) {
    // has() also gets called when looping over an array. We don't care about that
    if (!Array.isArray(target)) {
      log.info("---- HAS ----");
      log.info('HAS target:', target);
      log.info('HAS prop:', prop);
      addListener(target, prop);
    }

    return Reflect.has(target, prop);
  },
  set: function set(target, prop, value) {
    var path = makePath(target, prop);
    decorateWithPath(value, path);
    log.info("---- SET ----");
    log.info('SET target:', target);
    log.info('SET prop:', prop);
    log.info('SET from:', target[prop]);
    log.info('SET to:', value); // If
    // - the target is an Array, and
    // - the prop is a number,
    // - the result is an object
    // then we are replacing a whole array item. So, when notifying listeners, anything listening to changes
    // to that object (regardless of the prop) should get an update.

    if (Array.isArray(target) && !Number.isNaN(prop) && isObject(target[prop]) && isObject(value)) {
      var _result = Reflect.set(target, prop, value); // Now, we want anything that listens to any prop of the object in the array that is changing
      // to be updated


      notifyByPathStart(path, value);
      return _result;
    } // If the value is an array, wrap its items in proxies now
    // TODO: everything should be wrapped in a proxy when going in to the store, rather than when being read
    // I can do this in `decorateWithPath` to save looping through twice


    if (Array.isArray(value)) {
      var wrappedItems = value.map(function (item) {
        // For example, there may have been an existing array of proxied objects,
        // then some new, non-proxied objects were added. We'll need to wrap some but not
        // others
        return isProxy(item) ? item : createProxy(item, proxyHandler);
      });
      var wrappedArray = isProxy(wrappedItems) ? wrappedItems : createProxy(wrappedItems, proxyHandler); // We just created a new array, so we need to set this, again. Could be done better.

      addPathProp(wrappedArray, path);
      Reflect.set(target, prop, wrappedArray);
      notifyByPath({
        target: target,
        prop: prop,
        value: wrappedArray
      });
      return true;
    }

    var result = Reflect.set(target, prop, value);
    notifyByPath({
      target: target,
      prop: prop,
      value: value
    });
    return result;
  },
  deleteProperty: function deleteProperty(target, prop) {
    log.info("---- DELETE ----");
    log.info('DELETE target:', target);
    log.info('DELETE prop:', prop);
    var result = Reflect.deleteProperty(target, prop);
    notifyByPath({
      target: target,
      prop: prop
    });
    return result;
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
      _this._name = componentName;
      return _this;
    }

    _createClass(WrappedComponent, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        stopRecordingGetsForComponent();
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        removeListenersForComponent(this);
      }
    }, {
      key: "render",
      value: function render() {
        startRecordingGetsForComponent(this);
        return _react.default.createElement(ComponentToWrap, this.props);
      }
    }]);

    return WrappedComponent;
  }(_react.default.PureComponent);

  WrappedComponent.displayName = "Collected(".concat(componentName, ")");
  return WrappedComponent;
};

exports.collect = collect;
var rawStore = {};
addPathProp(rawStore, 'store');
var store = createProxy(rawStore, proxyHandler);
exports.store = store;
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