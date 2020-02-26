import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { removeListenersForComponent } from 'src/updating';
import state from 'src/shared/state';
import { debug } from 'src/shared/debug';
import { CollectOptions, CollectorComponent, WithStoreProp } from '../index.d';

const startRecordingGetsForComponent = (component) => {
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

const collect = <P extends {}>(
  ComponentToWrap: React.ComponentType<P>,
  options?: CollectOptions
): React.ComponentType<Pick<P, Exclude<keyof P, keyof WithStoreProp>>> => {
  const componentName =
    ComponentToWrap.displayName || ComponentToWrap.name || 'NamelessComponent';

  class WrappedComponent extends React.PureComponent<P & WithStoreProp>
    implements CollectorComponent {
    state = {
      // This might be called by React when a parent component has updated with a new store,
      // we want this component (if it's a child) to have that next store as well.
      nextStore: state.nextStore,
    };

    _name = componentName;

    _isMounted = false;

    _isMounting = true;

    // TODO (davidg): how to type this?
    // eslint-disable-next-line react/static-property-placement
    static displayName: string;

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
        this.setState({ nextStore: state.nextStore });
      }
    }

    render() {
      startRecordingGetsForComponent(this);

      return <ComponentToWrap {...this.props} store={this.state.nextStore} />;
    }
  }

  WrappedComponent.displayName = `Collected(${componentName})`;

  if (options && options.forwardRef) {
    type WrappedProps = React.ComponentProps<typeof WrappedComponent>;

    const WrappedWithRef = React.forwardRef((props: WrappedProps, ref) => (
      <WrappedComponent {...props} forwardedRef={ref} />
    ));

    // TODO (davidg): this is losing any statics in the type. See
    //  src/tests/unit/nonReactStatics.test.tsx

    // TODO (davidg): how to type this?
    //  https://github.com/DefinitelyTyped/DefinitelyTyped/blob/a05cc538a42243c632f054e42eab483ebf1560ab/types/react/index.d.ts#L770
    //  ??

    // @ts-ignore
    return hoistNonReactStatics(WrappedWithRef, ComponentToWrap);
  }

  return hoistNonReactStatics(WrappedComponent, ComponentToWrap);
};

export default collect;
