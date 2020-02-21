/* eslint-disable react/prop-types */
import React from 'react';
import { render } from '@testing-library/react';
import { collect, afterChange, store as globalStore, initStore } from 'src';

let renderCount;

const handleChange = jest.fn();
afterChange(handleChange);

const propPathChanges = handleChangeMock =>
  handleChangeMock.mock.calls.map(call => call[0].propPath);

beforeEach(() => {
  initStore({
    map: new Map([['one', 'the value of one']]),
    set: new Set(['one']),
  });

  renderCount = 0;
  handleChange.mockClear();
});

const log = jest.fn();

const RawComponent = ({ store }) => {
  renderCount++;

  return (
    <div>
      <h1>Map() stuff</h1>
      <p data-testid="map-size">Size: {store.map.size}</p>
      <p data-testid="map-one">One: {store.map.get('one') || 'nothing!'}</p>

      <button
        onClick={() => {
          store.map.set('two', 'the value of two');
          log(store.map.size);
        }}
      >
        Add two to Map
      </button>

      <button
        onClick={() => {
          store.map.delete('two');
        }}
      >
        Delete two from Map
      </button>

      <p data-testid="map-two">Two: {store.map.get('two') || 'nothing!'}</p>

      <button
        onClick={() => {
          store.map.clear();
        }}
      >
        Clear Map
      </button>

      <p data-testid="map-keys">{Array.from(store.map.keys()).join(', ')}</p>

      <button
        onClick={() => {
          store.map.set('three', 'the value of three');
          store.map.set('four', 'the value of four');
        }}
      >
        Add two things to Map
      </button>

      <h1>Set() stuff</h1>
      <p data-testid="set-size">Size: {store.set.size}</p>
      <p data-testid="set-one">Has one?: {store.set.has('one').toString()}</p>

      <button
        onClick={() => {
          store.set.add('two');
        }}
      >
        Add two to set
      </button>

      <button
        onClick={() => {
          store.set.delete('two');
        }}
      >
        Delete two from set
      </button>

      <p data-testid="set-two">Has two?: {store.set.has('two').toString()}</p>

      <button
        onClick={() => {
          store.set.clear();
        }}
      >
        Clear set
      </button>

      <p data-testid="set-keys">{Array.from(store.set.keys()).join(', ')}</p>

      <button
        onClick={() => {
          store.set.add('three');
          store.set.add('four');
        }}
      >
        Add two things to set
      </button>
    </div>
  );
};

const Component = collect(RawComponent);

it('should operate on a Map', () => {
  const { getByText, getByTestId } = render(<Component />);
  expect(renderCount).toBe(1);
  expect(globalStore.map.size).toBe(1);
  expect(getByTestId('map-size')).toHaveTextContent('Size: 1');
  expect(getByTestId('map-one')).toHaveTextContent('One: the value of one');

  getByText('Add two to Map').click();
  expect(globalStore.map.size).toBe(2);
  expect(log).toHaveBeenCalledWith(2);
  expect(renderCount).toBe(2);
  expect(getByTestId('map-size')).toHaveTextContent('Size: 2');
  expect(getByTestId('map-keys')).toHaveTextContent('one, two');
  expect(getByTestId('map-two')).toHaveTextContent('Two: the value of two');

  // Should not trigger another render
  getByText('Add two to Map').click();
  expect(renderCount).toBe(2);

  getByText('Delete two from Map').click();
  expect(renderCount).toBe(3);
  expect(getByTestId('map-size')).toHaveTextContent('Size: 1');
  expect(getByTestId('map-keys')).toHaveTextContent('one');
  expect(getByTestId('map-two')).toHaveTextContent('Two: nothing!');

  getByText('Clear Map').click();
  expect(renderCount).toBe(4);
  expect(getByTestId('map-size')).toHaveTextContent('Size: 0');
  expect(getByTestId('map-keys')).toHaveTextContent('');
  expect(getByTestId('map-one')).toHaveTextContent('One: nothing!');

  // Shouldn't render again
  getByText('Clear Map').click();
  expect(renderCount).toBe(4);

  getByText('Add two things to Map').click();
  expect(renderCount).toBe(5); // just one render
  expect(getByTestId('map-size')).toHaveTextContent('Size: 2');
  expect(getByTestId('map-keys')).toHaveTextContent('three, four');
});

it('should operate on a Set', () => {
  const { getByText, getByTestId } = render(<Component />);
  expect(renderCount).toBe(1);
  expect(getByTestId('set-size')).toHaveTextContent('Size: 1');
  expect(getByTestId('set-one')).toHaveTextContent('Has one?: true');
  expect(getByTestId('set-two')).toHaveTextContent('Has two?: false');

  getByText('Add two to set').click();
  expect(renderCount).toBe(2);
  expect(globalStore.set.size).toBe(2);
  expect(getByTestId('set-size')).toHaveTextContent('Size: 2');
  expect(getByTestId('set-keys')).toHaveTextContent('one, two');
  expect(getByTestId('set-two')).toHaveTextContent('Has two?: true');

  // Should not trigger another render
  getByText('Add two to set').click();
  expect(renderCount).toBe(2);

  getByText('Delete two from set').click();
  expect(renderCount).toBe(3);
  expect(globalStore.set.size).toBe(1);
  expect(getByTestId('set-size')).toHaveTextContent('Size: 1');
  expect(getByTestId('set-keys')).toHaveTextContent('one');
  expect(getByTestId('set-two')).toHaveTextContent('Has two?: false');

  getByText('Clear set').click();
  expect(renderCount).toBe(4);
  expect(globalStore.set.size).toBe(0);
  expect(getByTestId('set-size')).toHaveTextContent('Size: 0');
  expect(getByTestId('set-keys')).toHaveTextContent('');
  expect(getByTestId('set-one')).toHaveTextContent('Has one?: false');
  expect(getByTestId('set-two')).toHaveTextContent('Has two?: false');

  // Shouldn't render again
  getByText('Clear set').click();
  expect(renderCount).toBe(4);

  getByText('Add two things to set').click();
  expect(renderCount).toBe(5); // just one render
  expect(globalStore.set.size).toBe(2);
  expect(getByTestId('set-size')).toHaveTextContent('Size: 2');
  expect(getByTestId('set-keys')).toHaveTextContent('three, four');

  // TODO (davidg): what about creating an object, putting it in a set, then mutating
  //  the object?
});

it('should work with numeric keys', () => {
  globalStore.testMap = new Map();

  // This would fail if we were storing the key in a path string.
  globalStore.testMap.set(123, {
    properties: {
      name: 'David',
    },
  });
  globalStore.testMap.set('123', {
    properties: {
      name: 'Erica',
    },
  });

  const david = globalStore.testMap.get(123);
  const erica = globalStore.testMap.get('123');

  expect(david.properties.name).toBe('David');
  expect(erica.properties.name).toBe('Erica');
});

// The below test operates directly on the store, not via the component
it('should handle a Map', () => {
  globalStore.testMap = new Map([['david', { name: 'David', age: 100 }]]);
  globalStore.testMap.set('erica', {
    name: 'Erica',
    age: 45,
  });

  expect(globalStore.testMap.get('david')).toEqual({
    name: 'David',
    age: 100,
  });

  expect(propPathChanges(handleChange)).toEqual([
    'testMap',
    // Note that 'david' isn't here since it was part of the initial map
    'testMap.erica',
  ]);

  expect(globalStore.testMap.get('erica')).toEqual({
    name: 'Erica',
    age: 45,
  });

  handleChange.mockClear();

  // Should read some data without triggering changes
  expect(globalStore.testMap.get('david')).toEqual({ name: 'David', age: 100 });
  expect(globalStore.testMap.get('nope')).toBeUndefined();
  expect(globalStore.testMap.has('david')).toBe(true);
  expect(globalStore.testMap.has('nope')).toBe(false);

  expect(Array.from(globalStore.testMap.keys())).toEqual(['david', 'erica']);

  const entries = Array.from(globalStore.testMap.entries());
  expect(entries).toEqual([
    ['david', { name: 'David', age: 100 }],
    ['erica', { name: 'Erica', age: 45 }],
  ]);

  const forOfResult = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of globalStore.testMap) {
    forOfResult.push(item);
  }

  expect(forOfResult).toEqual(entries);

  const values = Array.from(globalStore.testMap.values());
  expect(values).toEqual([
    { name: 'David', age: 100 },
    { name: 'Erica', age: 45 },
  ]);

  const forEachResult = [];
  globalStore.testMap.forEach(value => {
    forEachResult.push(value);
  });

  expect(forEachResult).toEqual(values);

  // None of the above should trigger an update
  expect(handleChange).not.toHaveBeenCalled();

  globalStore.testMap.delete('david');
  expect(propPathChanges(handleChange)).toEqual(['testMap.delete']);
  expect(globalStore.testMap.get('david')).toBeUndefined();
  expect(globalStore.testMap.size).toBe(1);

  handleChange.mockClear();
  globalStore.testMap.set(0, 'a numeric key');
  expect(propPathChanges(handleChange)).toEqual(['testMap.0']);
  expect(globalStore.testMap.get(0)).toBe('a numeric key');
  expect(globalStore.testMap.size).toBe(2);

  handleChange.mockClear();
  globalStore.testMap.clear();
  expect(propPathChanges(handleChange)).toEqual(['testMap.clear']);
  expect(globalStore.testMap.get(0)).toBeUndefined();
  expect(globalStore.testMap.size).toBe(0);

  handleChange.mockClear();
  const objectKey = { an: 'object' };
  globalStore.testMap.set(objectKey, 'an object!');
  expect(propPathChanges(handleChange)).toEqual([
    // TODO (davidg): it's not great that the keys aren't unique if they're objects.
    //  It should work fine, but might over-notify
    'testMap.[object Object]',
  ]);
  handleChange.mockClear();

  expect(globalStore.testMap.get(objectKey)).toBe('an object!');

  // Overwrite that with a nested map
  globalStore.testMap.set(objectKey, new Map([['string key', 'the value']]));
  expect(propPathChanges(handleChange)).toEqual(['testMap.[object Object]']);
  expect(globalStore.testMap.get(objectKey).get('string key')).toBe(
    'the value'
  );

  expect(globalStore.testMap.size).toBe(1);
});
