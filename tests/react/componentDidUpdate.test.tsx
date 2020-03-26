/* eslint-disable max-classes-per-file */
import React, { Component, useEffect } from 'react';
import { waitFor } from '@testing-library/react';
import { collect, store as globalStore, initStore, WithStoreProp } from '../..';
import * as testUtils from '../testUtils';

interface Props extends WithStoreProp {
  reportUserChange: (comp: string, prev: number, next: number) => {};
}

// This test has multiple collected components to test a specific scenario
// https://github.com/davidgilbertson/react-recollect/issues/82

const LevelTwo = collect(
  class LevelTwoRaw extends Component<Props> {
    componentDidUpdate(prevProps: Props) {
      this.props.reportUserChange(
        'LevelTwo',
        prevProps.store.userId,
        this.props.store.userId
      );
    }

    render() {
      return <p>User ID: {this.props.store.userId}</p>;
    }
  }
);

const LevelOneA = collect(
  class LevelOneARaw extends Component<Props> {
    componentDidUpdate(prevProps: Props) {
      this.props.reportUserChange(
        'LevelOneA',
        prevProps.store.userId,
        this.props.store.userId
      );
    }

    render() {
      return (
        <div>
          <p>User ID: {this.props.store.userId}</p>

          <LevelTwo {...this.props} />
        </div>
      );
    }
  }
);

const LevelOneB = collect(
  class LevelOneBRaw extends Component<Props> {
    componentDidUpdate(prevProps: Props) {
      this.props.reportUserChange(
        'LevelOneB',
        prevProps.store.userId,
        this.props.store.userId
      );
    }

    render() {
      return <p>User ID: {this.props.store.userId}</p>;
    }
  }
);

const ParentComponent = collect(
  class ParentComponentRaw extends Component<Props> {
    componentDidUpdate(prevProps: Props) {
      this.props.reportUserChange(
        'ParentComponentRaw',
        prevProps.store.userId,
        this.props.store.userId
      );
    }

    render() {
      return (
        <div>
          <p>User ID: {this.props.store.userId}</p>
          <button
            onClick={() => {
              this.props.store.userId++;
            }}
          >
            Switch user
          </button>

          <LevelOneA {...this.props} />
          <LevelOneB {...this.props} />
        </div>
      );
    }
  }
);

const reportUserChange = jest.fn();

it('should handle a change in a value', () => {
  globalStore.userId = 1;

  const { getByText } = testUtils.renderStrict(
    <ParentComponent reportUserChange={reportUserChange} />
  );

  expect(reportUserChange).toHaveBeenCalledTimes(0);

  getByText('Switch user').click();

  expect(reportUserChange).toHaveBeenCalledTimes(4);

  expect(reportUserChange).toHaveBeenNthCalledWith(1, 'LevelTwo', 1, 2);
  expect(reportUserChange).toHaveBeenNthCalledWith(2, 'LevelOneA', 1, 2);
  expect(reportUserChange).toHaveBeenNthCalledWith(3, 'LevelOneB', 1, 2);
  expect(reportUserChange).toHaveBeenNthCalledWith(
    4,
    'ParentComponentRaw',
    1,
    2
  );
});

it('should re-render on a hidden prop read (FAILS)', () => {
  const sideEffectMock = jest.fn();
  globalStore.loaded = false;

  testUtils.collectAndRenderStrict(
    class extends Component<WithStoreProp> {
      componentDidUpdate(prevProps: Readonly<WithStoreProp>) {
        if (!prevProps.store.loaded && this.props.store.loaded) {
          sideEffectMock('I loaded!');
        }
      }

      render() {
        return <h1>Hello</h1>;
      }
    }
  );

  globalStore.loaded = true;

  // Note: this logically should have been called, but this demonstrates an
  // issue with Recollect: https://github.com/davidgilbertson/react-recollect/issues/85
  expect(sideEffectMock).toHaveBeenCalledTimes(0); // Should be 1!
  // The test below this one uses hooks and behaves as expected
});

it('should re-render on a hidden prop read with hooks', async () => {
  const sideEffectMock = jest.fn();
  globalStore.loaded = false;

  testUtils.collectAndRender(({ store }: WithStoreProp) => {
    useEffect(() => {
      if (store.loaded) {
        sideEffectMock('I loaded!');
      }
    }, [store.loaded]);

    return <h1>Hello</h1>;
  });

  expect(sideEffectMock).toHaveBeenCalledTimes(0);

  globalStore.loaded = true;

  await waitFor(() => {});

  expect(sideEffectMock).toHaveBeenCalledTimes(1);
  expect(sideEffectMock).toHaveBeenCalledWith('I loaded!');
});

it('should read the old store in componentDidUpdate', () => {
  initStore({
    aMap: new Map(),
    aSet: new Set(),
  });

  type Props = WithStoreProp & {
    aProp?: boolean;
    aMap: Map<string, string>;
    aSet: Set<string>;
  };

  let hasPropTestPassed = false;
  let ownKeysTestPassed = false;
  let mapTestPassed = false;
  let setTestPassed = false;

  const { getByText } = testUtils.collectAndRenderStrict(
    class MyComponent extends React.Component<Props> {
      componentDidUpdate(prevProps: Readonly<Props>): void {
        // These tests assert that reads from the store aren't redirected
        // to the 'next version' during the component's render cycle
        const prevStore = prevProps.store;
        const nextStore = this.props.store;

        // Test for 'has' trap (via 'in')
        const hadViaIn = 'aProp' in prevStore;
        const hasViaIn = 'aProp' in nextStore;
        if (!hadViaIn && hasViaIn) hasPropTestPassed = true;

        // Test for 'ownKeys' trap
        const hadViaOwnKeys = Object.keys(prevStore).includes('aProp');
        const hasViaOwnKeys = Object.keys(nextStore).includes('aProp');
        if (!hadViaOwnKeys && hasViaOwnKeys) ownKeysTestPassed = true;

        // Test for Map
        const hadAMapEntry = prevStore.aMap.has('anEntry');
        const hasAMapEntry = nextStore.aMap.has('anEntry');
        if (!hadAMapEntry && hasAMapEntry) mapTestPassed = true;

        // Test for Set
        const hadASetEntry = prevStore.aSet.has('anEntry');
        const hasASetEntry = nextStore.aSet.has('anEntry');
        if (!hadASetEntry && hasASetEntry) setTestPassed = true;
      }

      render() {
        const { store } = this.props;

        return (
          <div>
            <div>{store.aProp ?? 'No property'}</div>
            <div>{store.aMap.get('anEntry') ?? 'No Map entry'}</div>
            <div>
              {store.aSet.has('anEntry') ? 'A Set entry' : 'No Set entry'}
            </div>
            <button
              onClick={() => {
                store.aProp = 'A property';
                store.aMap.set('anEntry', 'A Map entry');
                store.aSet.add('anEntry');
              }}
            >
              Add data
            </button>
          </div>
        );
      }
    }
  );

  getByText('No property');
  getByText('No Map entry');
  getByText('No Set entry');

  getByText('Add data').click();

  getByText('A property');
  getByText('A Map entry');
  getByText('A Set entry');

  expect(hasPropTestPassed).toBe(true);
  expect(ownKeysTestPassed).toBe(true);
  expect(mapTestPassed).toBe(true);
  expect(setTestPassed).toBe(true);
});
