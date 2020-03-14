import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { removeListenersForComponent } from './updating';
import * as proxyManager from './proxyManager';
import state from './shared/state';
import { debug } from './shared/debug';
import { CollectorComponent, Store, WithStoreProp } from './shared/types';

// As we render down into a tree of collected components, we will start/stop
// recording
const componentStack: CollectorComponent[] = [];

const startRecordingGetsForComponent = (component: CollectorComponent) => {
  if (!state.isInBrowser) return;

  removeListenersForComponent(component);

  debug(() => {
    console.groupCollapsed(`RENDER: <${component._name}>`);
  });

  state.currentComponent = component;
  componentStack.push(state.currentComponent);
};

const stopRecordingGetsForComponent = () => {
  if (!state.isInBrowser) return;

  debug(() => {
    console.groupEnd();
  });

  componentStack.pop();
  state.currentComponent = componentStack[componentStack.length - 1] || null;
};

type RemoveStore<T> = Pick<T, Exclude<keyof T, keyof WithStoreProp>>;
type ComponentPropsWithoutStore<C extends React.ComponentType> = RemoveStore<
  React.ComponentProps<C>
>;

/**
 * This shallow clones the store to pass as state to the collected
 * component.
 */
const getStoreClone = () => {
  state.proxyIsMuted = true;

  // We'll shallow clone the store so React knows it's new
  const shallowClone = { ...state.store };

  // ... but redirect all reads to the real store
  state.nextVersionMap.set(shallowClone, state.store);

  const storeClone = proxyManager.createShallow(shallowClone);

  state.proxyIsMuted = false;

  return storeClone;
};

const collect = <C extends React.ComponentType<any>>(
  ComponentToWrap: C
): React.ComponentType<ComponentPropsWithoutStore<C>> &
  CollectorComponent &
  hoistNonReactStatics.NonReactStatics<C> => {
  const componentName =
    ComponentToWrap.displayName || ComponentToWrap.name || 'NamelessComponent';

  // The component that's passed in will require a `store` prop. The returned
  // component will not require a `store` prop, so we remove it
  type Props = ComponentPropsWithoutStore<C>;

  type ComponentState = {
    store: Store;
  };

  class WrappedComponent extends React.PureComponent<Props, ComponentState>
    implements CollectorComponent {
    state = {
      // This might be called by React when a parent component has updated with a new store,
      // we want this component (if it's a child) to have that next store as well.
      store: getStoreClone(),
    };

    // TODO (davidg) 2020-02-28: use private #isMounted, waiting on
    //  https://github.com/prettier/prettier/issues/7263
    private _isMounted = false;

    private _isMounting = true;

    _name = componentName;

    static displayName = `Collected(${componentName})`;

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

    update() {
      // 1. If the component has already unmounted, don't try and set the state
      // 2. The component might not have mounted YET, but is in the middle of its first
      //    render cycle.
      //    For example, if a user sets store.loading to true in App.componentDidMount
      if (this._isMounted || this._isMounting) {
        this.setState({ store: getStoreClone() });
      }
    }

    render() {
      startRecordingGetsForComponent(this);

      const props = {
        ...this.props,
        store: this.state.store,
      } as React.ComponentProps<C>;

      return <ComponentToWrap {...props} />;
    }
  }

  // @ts-ignore - I can't work this out
  return hoistNonReactStatics(WrappedComponent, ComponentToWrap);
};

export default collect;
