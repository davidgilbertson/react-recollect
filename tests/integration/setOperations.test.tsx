import React from 'react';
import {
  afterChange,
  initStore,
  store as globalStore,
  WithStoreProp,
} from '../..';
import * as testUtils from '../testUtils';

let renderCount: number;

const handleChange = jest.fn();
afterChange(handleChange);

beforeEach(() => {
  initStore({
    mySet: new Set(['one']),
  });

  renderCount = 0;
  handleChange.mockClear();
});

it('should operate on a Set', () => {
  const { getByText, getByTestId } = testUtils.collectAndRender(
    ({ store }: WithStoreProp) => {
      renderCount++;

      return (
        <div>
          <h1>Set() stuff</h1>
          <p data-testid="set-size">Size: {store.mySet.size}</p>
          <p data-testid="set-one">
            Has one?: {store.mySet.has('one').toString()}
          </p>

          <button
            onClick={() => {
              store.mySet.add('two');
            }}
          >
            Add two to set
          </button>

          <button
            onClick={() => {
              store.mySet.delete('two');
            }}
          >
            Delete two from set
          </button>

          <p data-testid="set-two">
            Has two?: {store.mySet.has('two').toString()}
          </p>

          <button
            onClick={() => {
              store.mySet.clear();
            }}
          >
            Clear set
          </button>

          <p data-testid="set-keys">
            {Array.from(store.mySet.keys()).join(', ')}
          </p>

          <button
            onClick={() => {
              store.mySet.add('three');
              store.mySet.add('four');
            }}
          >
            Add two things to set
          </button>
        </div>
      );
    }
  );

  expect(renderCount).toBe(1);
  expect(getByTestId('set-size')).toHaveTextContent('Size: 1');
  expect(getByTestId('set-one')).toHaveTextContent('Has one?: true');
  expect(getByTestId('set-two')).toHaveTextContent('Has two?: false');

  getByText('Add two to set').click();
  expect(renderCount).toBe(2);
  expect(globalStore.mySet.size).toBe(2);
  expect(getByTestId('set-size')).toHaveTextContent('Size: 2');
  expect(getByTestId('set-keys')).toHaveTextContent('one, two');
  expect(getByTestId('set-two')).toHaveTextContent('Has two?: true');

  // Should not trigger another render
  getByText('Add two to set').click();
  expect(renderCount).toBe(2);

  getByText('Delete two from set').click();
  expect(renderCount).toBe(3);
  expect(globalStore.mySet.size).toBe(1);
  expect(getByTestId('set-size')).toHaveTextContent('Size: 1');
  expect(getByTestId('set-keys')).toHaveTextContent('one');
  expect(getByTestId('set-two')).toHaveTextContent('Has two?: false');

  getByText('Clear set').click();
  expect(renderCount).toBe(4);
  expect(globalStore.mySet.size).toBe(0);
  expect(getByTestId('set-size')).toHaveTextContent('Size: 0');
  expect(getByTestId('set-keys')).toHaveTextContent('');
  expect(getByTestId('set-one')).toHaveTextContent('Has one?: false');
  expect(getByTestId('set-two')).toHaveTextContent('Has two?: false');

  // Shouldn't render again
  getByText('Clear set').click();
  expect(renderCount).toBe(4);

  getByText('Add two things to set').click();
  expect(renderCount).toBe(5); // just one render
  expect(globalStore.mySet.size).toBe(2);
  expect(getByTestId('set-size')).toHaveTextContent('Size: 2');
  expect(getByTestId('set-keys')).toHaveTextContent('three, four');

  // TODO (davidg): what about creating an object, putting it in a set, then mutating
  //  the object?
});
