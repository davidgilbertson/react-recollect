import React from 'react';
import {
  afterChange,
  initStore,
  store as globalStore,
  WithStoreProp,
} from '../..';
import * as testUtils from '../testUtils';

declare module '../..' {
  interface Store {
    myArray?: Array<{
      text?: string;
      newProp?: string;
    }>;
  }
}

const handleChange = jest.fn();
afterChange(handleChange);

/**
 * Rules for updating:
 * - If a PROP on a TARGET is updated, notify listeners of that PROP
 * - If the size of a TARGET changes (object, array, map or set) then notify
 *    anything listening to the TARGET
 */
describe('should follow the update rules', () => {
  globalStore.data = {
    myObj: {},
    myArr: [],
    myMap: new Map(),
    mySet: new Set(),
  };
  jest.resetAllMocks();

  test('for objects', () => {
    // Adding a new prop, notify on the target
    globalStore.data.myObj.foo = 'bar';
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.myObj']);
    jest.resetAllMocks();

    // Changing a value, notify on the prop
    globalStore.data.myObj.foo = 'baz';
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.myObj.foo']);
    jest.resetAllMocks();

    // A no-op, don't notify
    globalStore.data.myObj.foo = 'baz';
    expect(testUtils.propPathChanges(handleChange)).toEqual([]);

    // Removing a prop, notify on the target
    delete globalStore.data.myObj.foo;
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.myObj']);
    jest.resetAllMocks();
  });

  test('for arrays', () => {
    // Adding to an array, notify on the target
    globalStore.data.myArr.push(11, 77, 33);
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.myArr']);
    jest.resetAllMocks();

    // Modifying an array index, notify on the prop
    globalStore.data.myArr[1] = 22;
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.myArr.1']);
    jest.resetAllMocks();

    // Mutating the array, notify on the target
    globalStore.data.myArr.reverse();
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.myArr']);
    jest.resetAllMocks();

    // Removing from the array, notify on the target
    globalStore.data.myArr.length = 0;
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.myArr']);
    jest.resetAllMocks();

    // A no-op, don't notify
    globalStore.data.myArr.length = 0;
    expect(testUtils.propPathChanges(handleChange)).toEqual([]);
  });

  test('for maps', () => {
    // Adding to a map, notify on the target
    globalStore.data.myMap.set('foo', 'bar');
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.myMap']);
    jest.resetAllMocks();

    // Modifying a map entry, notify on the prop
    globalStore.data.myMap.set('foo', 'baz');
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.myMap.foo']);
    jest.resetAllMocks();

    // Deleting from the map, notify on the target
    globalStore.data.myMap.delete('foo');
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.myMap']);
    jest.resetAllMocks();

    // No op, don't notify
    globalStore.data.myMap.clear();
    expect(testUtils.propPathChanges(handleChange)).toEqual([]);
  });

  test('for sets', () => {
    // Adding to a set, notify on the target
    globalStore.data.mySet.add('foo');
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.mySet']);
    jest.resetAllMocks();

    // Removing from a set, notify on the target
    globalStore.data.mySet.delete('foo');
    expect(testUtils.propPathChanges(handleChange)).toEqual(['data.mySet']);
    jest.resetAllMocks();

    // No-op, don't notify
    globalStore.data.mySet.clear();
    expect(testUtils.propPathChanges(handleChange)).toEqual([]);
  });
});

it('should only update on certain store changes', () => {
  initStore();
  globalStore.myArray = [
    {
      text: 'first',
    },
  ];

  let renderCount = 0;

  const { getByText } = testUtils.collectAndRender(
    ({ store }: WithStoreProp) => {
      renderCount++;

      const text = store.myArray && store.myArray[0]?.text;
      return <div>{text || 'No text found'}</div>;
    }
  );

  expect(testUtils.getAllListeners()).toEqual([
    'myArray',
    'myArray.0',
    'myArray.0.text',
  ]);

  // should render the title
  getByText('first');
  expect(renderCount).toBe(1);
  renderCount = 0;

  // This will add a property to the root-level, triggering a render
  globalStore.newProp = 'a new prop';
  expect(renderCount).toBe(1);
  renderCount = 0;

  globalStore.myArray.push({});
  expect(renderCount).toBe(1);
  renderCount = 0;

  globalStore.myArray[0].newProp = 'a new prop';
  expect(renderCount).toBe(1);
  renderCount = 0;

  globalStore.myArray[0].text = 'second';
  expect(renderCount).toBe(1);
  renderCount = 0;
  getByText('second');

  globalStore.myArray[0] = {}; // replace the whole object
  expect(renderCount).toBe(1);
  renderCount = 0;
  getByText('No text found');

  globalStore.myArray.length = 0;
  expect(renderCount).toBe(1);
  renderCount = 0;
  getByText('No text found');

  // Empty the store. This deletes props individually, resulting in multiple
  // updates to the top-level object. Rare enough that it's fine.
  initStore();
  expect(renderCount).toBe(2);
  getByText('No text found');
});

it('should update on clearing a map', () => {
  initStore();
  globalStore.myMap = new Map([['foo', 'bar']]);

  let renderCount = 0;

  const { getByText } = testUtils.collectAndRender(
    ({ store }: WithStoreProp) => {
      renderCount++;

      const item = store.myMap.get('foo');
      return <div>{item || 'No item found'}</div>;
    }
  );

  expect(testUtils.getAllListeners()).toEqual(['myMap', 'myMap.foo']);

  getByText('bar');
  expect(renderCount).toBe(1);
  renderCount = 0;

  globalStore.myMap.set('foo', 'baz');
  getByText('baz');
  expect(renderCount).toBe(1);
  renderCount = 0;

  globalStore.myMap.clear();
  expect(renderCount).toBe(1);
  renderCount = 0;
  getByText('No item found');

  globalStore.myMap.set('foo', 'baz');
  getByText('baz');
  expect(renderCount).toBe(1);
  renderCount = 0;

  globalStore.myMap.delete('foo');
  getByText('No item found');
  expect(renderCount).toBe(1);
});

it('should update a component showing map size', () => {
  initStore();
  globalStore.myMap = new Map();

  let renderCount = 0;

  const { getByText } = testUtils.collectAndRender(
    ({ store }: WithStoreProp) => {
      renderCount++;

      return <div>{`Size: ${store.myMap.size}`}</div>;
    }
  );

  // Note that it listens only on the parent, not `size`
  expect(testUtils.getAllListeners()).toEqual(['myMap']);

  getByText('Size: 0');
  expect(renderCount).toBe(1);
  renderCount = 0;

  globalStore.myMap.set('foo', 'bar');
  getByText('Size: 1');
  expect(renderCount).toBe(1);
  renderCount = 0;

  // A change to the set contents, but it not should affect the parent
  globalStore.myMap.set('foo', 'baz');
  getByText('Size: 1');
  expect(renderCount).toBe(0);
  renderCount = 0;

  globalStore.myMap.clear();
  getByText('Size: 0');
  expect(renderCount).toBe(1);
});
