import React from 'react';
import { getStore } from './store';
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
  // currentComponent = component;
  setCurrentComponent(component);
};

const stopRecordingGetsForComponent = () => {
  // currentComponent = null;
  unsetCurrentComponent();
};

export const collect = ComponentToWrap => {
  const componentName = ComponentToWrap.displayName || ComponentToWrap.name || 'NamelessComponent';

  class WrappedComponent extends React.PureComponent {
    constructor() {
      super();
      this.state = {
        store: getStore(), // whatever the current state is
      };
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

      return <ComponentToWrap {...this.props} store={this.state.store} />;
    }
  }

  WrappedComponent.displayName = `Collected(${componentName})`;

  return WrappedComponent;
};
