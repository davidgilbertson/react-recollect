"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.collect = exports.unsetCurrentComponent = exports.setCurrentComponent = exports.getCurrentComponent = void 0;

var _react = _interopRequireDefault(require("react"));

var _store = require("./store");

var _updating = require("./updating");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var currentComponent;

var getCurrentComponent = function getCurrentComponent() {
  return currentComponent;
};

exports.getCurrentComponent = getCurrentComponent;

var setCurrentComponent = function setCurrentComponent(component) {
  currentComponent = component;
};

exports.setCurrentComponent = setCurrentComponent;

var unsetCurrentComponent = function unsetCurrentComponent() {
  currentComponent = null;
};

exports.unsetCurrentComponent = unsetCurrentComponent;

var startRecordingGetsForComponent = function startRecordingGetsForComponent(component) {
  (0, _updating.removeListenersForComponent)(component);
  setCurrentComponent(component);
};

var stopRecordingGetsForComponent = function stopRecordingGetsForComponent() {
  unsetCurrentComponent();
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
      _this.state = {
        // This might be called by React when a parent component has updated with a new store,
        // we want this component (if it's a child) to have that next store as well.
        store: (0, _store.getNextStore)() // whatever the current state is

      };
      _this._name = componentName; // TODO (davidg): use more obscure name, or symbol

      _this._isMounted = false;
      return _this;
    }

    _createClass(WrappedComponent, [{
      key: "update",
      value: function update(newStore) {
        if (this._isMounted) {
          this.setState({
            store: newStore
          });
        }
      }
    }, {
      key: "componentDidMount",
      value: function componentDidMount() {
        this._isMounted = true; // Stop recording. For first render()

        stopRecordingGetsForComponent();
      }
    }, {
      key: "componentDidUpdate",
      value: function componentDidUpdate() {
        // Stop recording. For not-first render()
        stopRecordingGetsForComponent();
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        (0, _updating.removeListenersForComponent)(this);
        this._isMounted = false;
      }
    }, {
      key: "render",
      value: function render() {
        startRecordingGetsForComponent(this); // TODO (davidg): Problem. If you do store.this = 1 and store.that = 2, then
        // a render will be called twice while data is still being written (synchronously) so
        // any reads to data while its writing get attributed to this component.
        // I think the solution is to only do 'setState()' on the next tick after any writing
        // to the store.
        // Write a test to demonstrate this. Or is this fixed by getNextStore()?

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