import React, { useEffect, useLayoutEffect, useState } from 'react';
import { waitFor, act } from '@testing-library/react';
import { store as globalStore, WithStoreProp } from '../..';
import * as testUtils from '../testUtils';

it('should work with useState hook', () => {
  globalStore.counter = 0;

  const { getByText } = testUtils.collectAndRenderStrict(
    ({ store }: WithStoreProp) => {
      const [counter, setCounter] = useState(0);

      return (
        <div>
          <div>{`State count: ${counter}`}</div>

          <div>{`Store count: ${store.counter}`}</div>

          <button
            onClick={() => {
              setCounter((prevCount) => prevCount + 1);
            }}
          >
            Increment state
          </button>

          <button
            onClick={() => {
              store.counter++;
            }}
          >
            Increment store
          </button>
        </div>
      );
    }
  );

  getByText('State count: 0');
  getByText('Store count: 0');

  getByText('Increment state').click();
  getByText('State count: 1');
  getByText('Store count: 0');

  getByText('Increment store').click();
  getByText('State count: 1');
  getByText('Store count: 1');
});

it('should work with useEffect hook', async () => {
  globalStore.counter = 0;
  const onMountMock = jest.fn();
  const onCountChangeMock = jest.fn();

  const { getByText } = testUtils.collectAndRenderStrict(
    ({ store }: WithStoreProp) => {
      useEffect(() => {
        onMountMock();
      }, []);

      useEffect(() => {
        onCountChangeMock();
      }, [store.counter]);

      return (
        <div>
          <div>{`Store count: ${store.counter}`}</div>

          <button
            onClick={() => {
              store.counter++;
            }}
          >
            Increment store
          </button>
        </div>
      );
    }
  );

  expect(onMountMock).toHaveBeenCalledTimes(1);
  expect(onCountChangeMock).toHaveBeenCalledTimes(1);

  getByText('Store count: 0');
  act(() => {
    getByText('Increment store').click();
  });
  getByText('Store count: 1');

  await waitFor(() => {}); // useEffect is async

  expect(onCountChangeMock).toHaveBeenCalledTimes(2);
  expect(onMountMock).toHaveBeenCalledTimes(1);
});

it('should work with useEffect hook on mount', async () => {
  globalStore.loaded = false;
  let renderCount = 0;

  const { getByText } = testUtils.collectAndRender(
    ({ store }: WithStoreProp) => {
      // Using useEffect like 'componentDidMount'
      useEffect(() => {
        store.loaded = true;
      }, []);

      renderCount++;
      return <div>{store.loaded ? 'Loaded' : 'Loading...'}</div>;
    }
  );

  // Interesting. React 'defers' the useEffect(), but it happens in the same
  // tick. So by the time this line runs, the component has already rendered
  // twice and store.loaded is true;
  getByText('Loaded');
  expect(renderCount).toBe(2);
});

it('changing store in useLayoutEffect should error', async () => {
  globalStore.loaded = false;

  testUtils.expectToLogError(() => {
    testUtils.collectAndRenderStrict(({ store }: WithStoreProp) => {
      useLayoutEffect(() => {
        // Oh no, useLayoutEffect is synchronous, so will fire during render
        store.loaded = true;
      }, []);

      return <div>{store.loaded ? 'Loading...' : 'Loading'}</div>;
    });
  });
});
