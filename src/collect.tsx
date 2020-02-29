import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { removeListenersForComponent } from './updating';
import state from './shared/state';
import { debug } from './shared/debug';
import {
  CollectOptions,
  CollectorComponent,
  Store,
  WithStoreProp,
} from './shared/types';

const startRecordingGetsForComponent = (component: CollectorComponent) => {
  removeListenersForComponent(component);

  debug(() => {
    console.groupCollapsed(`RENDER: <${component._name}>`);
  });

  state.currentComponent = component;
};

const stopRecordingGetsForComponent = () => {
  debug(() => {
    console.groupEnd();
  });

  state.currentComponent = null;
};

type ComponentState = {
  store: Store;
};

const collect = <P extends {}>(
  ComponentToWrap: React.ComponentType<P>,
  options?: CollectOptions
): React.ComponentType<Pick<P, Exclude<keyof P, keyof WithStoreProp>>> => {
  const componentName =
    ComponentToWrap.displayName || ComponentToWrap.name || 'NamelessComponent';

  class WrappedComponent
    extends React.PureComponent<P & WithStoreProp, ComponentState>
    implements CollectorComponent {
    state = {
      // This might be called by React when a parent component has updated with a new store,
      // we want this component (if it's a child) to have that next store as well.
      store: state.nextStore,
    };

    // TODO (davidg) 2020-02-28: use private #isMounted, waiting on
    //  https://github.com/prettier/prettier/issues/7263
    _isMounted = false;

    _isMounting = true;

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
        this.setState({ store: state.nextStore });
      }
    }

    render() {
      startRecordingGetsForComponent(this);

      return <ComponentToWrap {...this.props} store={this.state.store} />;
    }
  }

  if (options && options.forwardRef) {
    type WrappedProps = React.ComponentProps<typeof WrappedComponent>;

    // TODO (davidg): why is forwardedRef not ref? ATM I would need `ref` in
    //  props, so the parent component knows to pass this. But forwardedRef
    //  is defined in WithStoreProp - confusing
    const WrappedWithRef = React.forwardRef((props: WrappedProps, ref) => (
      <WrappedComponent {...props} forwardedRef={ref} />
    ));

    // TODO (davidg): this is losing any statics in the type. See
    //  src/tests/unit/nonReactStatics.test.tsx

    // TODO (davidg): how to type this?
    //  https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a05cc538a42243c632f054e42eab483ebf1560ab/types/react/index.d.ts#L770
    //  ??

    // We recommend to the user that they define the type of Ref in their
    // own props.
    // @ts-ignore
    return hoistNonReactStatics(WrappedWithRef, ComponentToWrap);
  }

  // @ts-ignore
  return hoistNonReactStatics(WrappedComponent, ComponentToWrap);
};

export default collect;
