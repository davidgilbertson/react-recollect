import React from 'react';
import { render } from '@testing-library/react';
import {
  afterChange,
  collect,
  initStore,
  store as globalStore,
  WithStoreProp,
} from '../../src';
import { propPathChanges } from '../testUtils';

let renderCount: number;

const handleChange = jest.fn();
afterChange(handleChange);

beforeEach(() => {
  initStore({
    myMap: new Map([['one', 'the value of one']]),
    mySet: new Set(['one']),
  });

  renderCount = 0;
  handleChange.mockClear();
});

const log = jest.fn();

const RawComponent = ({ store }: WithStoreProp) => {
  renderCount++;

  return (
    <div>
      <h1>Map() stuff</h1>
      <p data-testid="map-size">Size: {store.myMap.size}</p>
      <p data-testid="map-one">One: {store.myMap.get('one') || 'nothing!'}</p>

      <button
        onClick={() => {
          store.myMap.set('two', 'the value of two');
          log(store.myMap.size);
        }}
      >
        Add two to Map
      </button>

      <button
        onClick={() => {
          store.myMap.delete('two');
        }}
      >
        Delete two from Map
      </button>

      <p data-testid="map-two">Two: {store.myMap.get('two') || 'nothing!'}</p>

      <button
        onClick={() => {
          store.myMap.clear();
        }}
      >
        Clear Map
      </button>

      <p data-testid="map-keys">{Array.from(store.myMap.keys()).join(', ')}</p>

      <button
        onClick={() => {
          store.myMap.set('three', 'the value of three');
          store.myMap.set('four', 'the value of four');
        }}
      >
        Add two things to Map
      </button>

      <h1>Set() stuff</h1>
      <p data-testid="set-size">Size: {store.mySet.size}</p>
      <p data-testid="set-one">Has one?: {store.mySet.has('one').toString()}</p>

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

      <p data-testid="set-two">Has two?: {store.mySet.has('two').toString()}</p>

      <button
        onClick={() => {
          store.mySet.clear();
        }}
      >
        Clear set
      </button>

      <p data-testid="set-keys">{Array.from(store.mySet.keys()).join(', ')}</p>

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
};

const Component = collect(RawComponent);

it('should operate on a Map in a component', () => {
  const { getByText, getByTestId } = render(<Component />);
  expect(renderCount).toBe(1);
  expect(globalStore.myMap.size).toBe(1);
  expect(getByTestId('map-size')).toHaveTextContent('Size: 1');
  expect(getByTestId('map-one')).toHaveTextContent('One: the value of one');

  getByText('Add two to Map').click();
  expect(globalStore.myMap.size).toBe(2);
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

type Person = {
  name: string;
  age: number;
};

// The below test operates directly on the store, not via the component
it('should handle a Map', () => {
  globalStore.testMap = new Map([['david', { name: 'David', age: 100 }]]);

  expect(propPathChanges(handleChange)).toEqual(['']);
  jest.resetAllMocks();

  globalStore.testMap.set('erica', {
    name: 'Erica',
    age: 45,
  });

  // Note that the change was fired at `testMap` because this changed the
  // size of the map.
  expect(propPathChanges(handleChange)).toEqual(['testMap']);
  jest.resetAllMocks();

  globalStore.testMap.set('erica', {
    name: 'Erica',
    age: 42,
  });

  // This time, we just updated an existing item, so the change is fired more
  // precisely
  expect(propPathChanges(handleChange)).toEqual(['testMap.erica']);

  expect(globalStore.testMap.get('david')).toEqual({
    name: 'David',
    age: 100,
  });

  expect(globalStore.testMap.get('erica')).toEqual({
    name: 'Erica',
    age: 42,
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
    ['erica', { name: 'Erica', age: 42 }],
  ]);

  const forOfResult: Person[] = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const item of globalStore.testMap) {
    forOfResult.push(item);
  }

  expect(forOfResult).toEqual(entries);

  const values = Array.from(globalStore.testMap.values());
  expect(values).toEqual([
    { name: 'David', age: 100 },
    { name: 'Erica', age: 42 },
  ]);

  const forEachResult: Person[] = [];
  globalStore.testMap.forEach((value: Person) => {
    forEachResult.push(value);
  });

  expect(forEachResult).toEqual(values);

  // None of the above should trigger an update
  expect(handleChange).not.toHaveBeenCalled();

  globalStore.testMap.delete('david');
  expect(propPathChanges(handleChange)).toEqual(['testMap']);
  expect(globalStore.testMap.get('david')).toBeUndefined();
  expect(globalStore.testMap.size).toBe(1);

  handleChange.mockClear();
  globalStore.testMap.set(0, 'a numeric key');
  expect(propPathChanges(handleChange)).toEqual(['testMap']);
  expect(globalStore.testMap.get(0)).toBe('a numeric key');
  expect(globalStore.testMap.size).toBe(2);

  handleChange.mockClear();
  globalStore.testMap.clear();
  expect(propPathChanges(handleChange)).toEqual(['testMap']);
  expect(globalStore.testMap.get(0)).toBeUndefined();
  expect(globalStore.testMap.size).toBe(0);

  handleChange.mockClear();
  const objectKey = { an: 'object' };
  globalStore.testMap.set(objectKey, 'an object!');
  expect(propPathChanges(handleChange)).toEqual(['testMap']);
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
