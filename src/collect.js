import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { getNextStore } from './store';
import { removeListenersForComponent } from './updating';

let currentComponent;

export const getCurrentComponent = () => currentComponent;

export const setCurrentComponent = component => {
  currentComponent = component;
};

export const unsetCurrentComponent = () => {
  currentComponent = null;
};

const startRecordingGetsForComponent = component => {
  removeListenersForComponent(component);
  setCurrentComponent(component);
};

const stopRecordingGetsForComponent = () => {
  unsetCurrentComponent();
};

export const collect = (ComponentToWrap, { forwardRef } = {}) => {
  const componentName = ComponentToWrap.displayName || ComponentToWrap.name || 'NamelessComponent';

  class WrappedComponent extends React.PureComponent {
    constructor() {
      super();
      this.state = {
        // This might be called by React when a parent component has updated with a new store,
        // we want this component (if it's a child) to have that next store as well.
        store: getNextStore(),
      };
      this._name = componentName;
      this._isMounted = false;
      this._isMounting = true;
    }

    update(newStore) {
      // 1. If the component has already unmounted, don't try and set the state
      // 2. The component might not have mounted YET, but is in the middle of its first
      //    render cycle.
      //    For example, if a user sets store.loading to true in App.componentDidMount
      if (this._isMounted || this._isMounting) {
        this.setState({ store: newStore });
      }
    }

    componentDidMount() {
      this._isMounted = true;
      this._isMounting = false;

      // Stop recording. For first render()
      stopRecordingGetsForComponent();
    }

    componentDidUpdate() {
      // Stop recording. For not-first render()
      stopRecordingGetsForComponent();
    }

    componentWillUnmount() {
      removeListenersForComponent(this);
      this._isMounted = false;
    }

    render() {
      startRecordingGetsForComponent(this);

      return <ComponentToWrap {...this.props} store={this.state.store} />;
    }
  }

  WrappedComponent.displayName = `Collected(${componentName})`;

  if (forwardRef) {
    const WrappedWithRef = React.forwardRef((props, ref) => (
      <WrappedComponent {...props} forwardedRef={ref} />
    ));

    return hoistNonReactStatics(WrappedWithRef, ComponentToWrap);
  }

  return hoistNonReactStatics(WrappedComponent, ComponentToWrap);
};
