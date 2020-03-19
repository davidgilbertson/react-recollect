import React, { useState } from 'react';
import {
  initStore,
  store as globalStore,
  useProps,
  WithStoreProp,
} from '../../src';
import * as testUtils from '../testUtils';

beforeEach(() => {
  initStore({
    prop1: 'This is prop1',
    prop2: 'This is prop2',
  });
});

it('should listen to props', () => {
  testUtils.collectAndRender(({ store }: any) => {
    useProps([store.prop1]);

    return (
      <div>
        <p>{store.prop2}</p>
      </div>
    );
  });

  expect(testUtils.getAllListeners()).toEqual(['prop1', 'prop2']);
});

it('should work inline', () => {
  const { container } = testUtils.collectAndRender(({ store }: any) => (
    <div>
      {useProps([store.prop1])}
      <p>{store.prop2}</p>
    </div>
  ));

  // useProps doesn't render anything
  expect(container.innerHTML).toBe('<div><p>This is prop2</p></div>');

  expect(testUtils.getAllListeners()).toEqual(['prop1', 'prop2']);
});

it('should handle duplicate props', () => {
  globalStore.arr = [
    {
      name: 'David',
      age: 75,
    },
  ];
  globalStore.loading = false;

  testUtils.collectAndRender(({ store }: any) => {
    useProps([
      store, // Redundant
      store.prop1,
      store.prop2, // Redundant (used during render)
      store.arr[0].name,
      store.arr, // Redundant (inferred from store.arr[0].name)
      store.loaded, // Redundant (used during render)
    ]);

    return (
      <div>
        {!store.loaded && <p>Loading...</p>}
        <p>{store.prop2}</p>
      </div>
    );
  });

  expect(testUtils.getAllListeners()).toEqual([
    'prop1',
    'prop2',
    'arr',
    'arr.0',
    'arr.0.name',
    'loaded',
  ]);
});

it('should ignore non-store props', () => {
  testUtils.collectAndRender(({ store }: any) => {
    const listOfAnimals = ['cats', 'dogs', 'Sid Vicious'];

    useProps([store.prop1, listOfAnimals]);

    return (
      <div>
        <p>{store.prop2}</p>
      </div>
    );
  });

  expect(testUtils.getAllListeners()).toEqual(['prop1', 'prop2']);
});

it('can be used multiple times', () => {
  testUtils.collectAndRender(({ store }: any) => {
    useProps([store.prop1]);
    useProps([store.prop3]);
    useProps([store.prop4]);

    return (
      <div>
        <p>{store.prop2}</p>
      </div>
    );
  });

  expect(testUtils.getAllListeners()).toEqual([
    'prop1',
    'prop3',
    'prop4', // doesn't exist, doesn't matter
    'prop2',
  ]);
});

it('can be read in lifecycle methods', () => {
  // These work, but aren't a good idea. Maybe one day this will be a warning.
  testUtils.collectAndRender(
    class MyComponent extends React.Component<WithStoreProp, any> {
      state = {};

      componentDidMount() {
        useProps([this.props.store.componentDidMountProp]);
      }

      static getDerivedStateFromProps(props: Readonly<WithStoreProp>) {
        useProps([props.store.getDerivedStateFromPropsProp]);
        return null;
      }

      render() {
        const { store } = this.props;
        useProps([store.prop1]);

        return (
          <div>
            <p>{store.prop2}</p>
          </div>
        );
      }
    }
  );

  expect(testUtils.getAllListeners()).toEqual([
    'getDerivedStateFromPropsProp',
    'prop1',
    'prop2',
    'componentDidMountProp',
  ]);
});

it('should work with changing state', () => {
  type Props = WithStoreProp & {
    hiddenMessage: string;
  };

  const { queryByText, getByText } = testUtils.collectAndRender(
    ({ store }: Props) => {
      const [showHiddenMessage, setShowHiddenMessage] = useState(false);

      useProps([store.hiddenMessage]);

      return (
        <div>
          {showHiddenMessage && <p>{store.hiddenMessage}</p>}

          <button
            onClick={() => {
              setShowHiddenMessage(true);
            }}
          >
            Show hidden message
          </button>
        </div>
      );
    }
  );

  expect(testUtils.getAllListeners()).toEqual(['hiddenMessage']);

  expect(queryByText('Hidden message')).not.toBeInTheDocument();

  globalStore.hiddenMessage = 'Hidden message';
  getByText('Show hidden message').click();

  expect(queryByText('Hidden message')).toBeInTheDocument();

  globalStore.hiddenMessage = 'A new message!';

  expect(queryByText('A new message!')).toBeInTheDocument();
});
