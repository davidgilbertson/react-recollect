import React from 'react';
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

export const collect = ComponentToWrap => {
  const componentName = ComponentToWrap.displayName || ComponentToWrap.name || 'NamelessComponent';

  class WrappedComponent extends React.PureComponent {
    constructor() {
      super();
      this.state = {
        // This might be called by React when a parent component has updated with a new store,
        // we want this component (if it's a child) to have that next store as well.
        store: getNextStore(), // whatever the current state is
      };
      this._name = componentName; // TODO (davidg): use more obscure name, or symbol
      this._isMounted = false;
    }

    update(newStore) {
      if (this._isMounted) {
        this.setState({ store: newStore });
      }
    }

    componentDidMount() {
      this._isMounted = true;

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

      // TODO (davidg): Problem. If you do store.this = 1 and store.that = 2, then
      // a render will be called twice while data is still being written (synchronously) so
      // any reads to data while its writing get attributed to this component.
      // I think the solution is to only do 'setState()' on the next tick after any writing
      // to the store.
      // Write a test to demonstrate this. Or is this fixed by getNextStore()?

      return <ComponentToWrap {...this.props} store={this.state.store} />;
    }
  }

  WrappedComponent.displayName = `Collected(${componentName})`;

  return WrappedComponent;
};
