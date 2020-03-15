import { wait } from '@testing-library/react';
import { store } from '../../src';

it('should keep a reference', () => {
  store.testArray = [{ name: 'David' }];

  // Get a reference to the item
  const david = store.testArray[0];

  // But now clear out the array where that object lived.
  store.testArray = [];

  expect(david).not.toBeUndefined();

  expect(david.name).toBe('David');
});

it('should handle shuffling arrays about', () => {
  store.stackOne = [{ id: 1 }, { id: 2 }];
  store.stackTwo = [];

  store.stackTwo.push(store.stackOne.pop());

  expect(store.stackOne).toEqual([{ id: 1 }]);
  expect(store.stackTwo).toEqual([{ id: 2 }]);

  store.stackTwo.push(store.stackOne.pop());

  expect(store.stackOne).toEqual([]);
  expect(store.stackTwo).toEqual([{ id: 2 }, { id: 1 }]);

  store.stackTwo.forEach((item: { id: number }) => {
    // eslint-disable-next-line no-param-reassign
    item.id *= 5;
  });

  const [second, first] = store.stackTwo;
  store.stackTwo = [first, second];
  expect(store.stackTwo).toEqual([{ id: 5 }, { id: 10 }]);
});

it('should keep a reference async', async () => {
  store.testArray = [{ name: 'David' }];
  const arr = store.testArray;
  expect(arr[0].name).toBe('David');

  await wait(); // Testing that the nextVersionMap isn't cleared

  // Get a reference to the item
  const david = store.testArray[0];

  // But now clear out the array where that object lived.
  store.testArray = [];

  expect(david).not.toBeUndefined();

  expect(david.name).toBe('David');
  expect(arr[0].name).toBe('David');
});

it('should keep a reference when cloning', () => {
  store.testArray = [{ name: 'David' }];

  // Cloning this will remove the proxy and path
  const david = { ...store.testArray[0] };

  store.testArray = [];

  expect(david).not.toBeUndefined();

  expect(david.name).toBe('David');
});

it('should handle reference breaking', () => {
  store.data = { text: 'one' };

  const ref = store.data;

  expect(ref.text).toBe('one');

  // Break the reference between `ref` and `store.data`
  store.data = 'something else';

  expect(ref.text).toBe('one');
});

it('should handle reference breaking', () => {
  // Same as the above test, but both `data` objects are proxiable
  store.data = ['one', 'two'];

  const ref = store.data;

  expect(ref[0]).toBe('one');

  // Break the reference between `ref` and `data`
  store.data = { three: 'four' };

  expect(ref[0]).toBe('one');
  expect(ref.three).toBeUndefined();
});

it('should not allow a clone to update store', () => {
  store.data = { text: 'one' };

  const dataClone = { ...store.data };

  dataClone.text = 'two';

  expect(dataClone.text).toBe('two'); // clone changes
  expect(store.data.text).toBe('one'); // store does not

  // But it will still deep update the store
  const storeClone = { ...store };

  // This is just a shallow clone
  expect(storeClone.data).toBe(store.data);

  storeClone.data.text = 'three';

  expect(storeClone.data.text).toBe('three');
  expect(store.data.text).toBe('three');
});

it('should sort a clone separately', () => {
  store.tasks = [
    {
      id: 2,
      name: 'Task 2',
    },
    {
      id: 1,
      name: 'Task 1',
    },
    {
      id: 0,
      name: 'Task 0',
    },
  ];

  const clonedTasks = store.tasks.slice();

  // Slicing doesn't clone the contents
  expect(store.tasks[0]).toBe(clonedTasks[0]);

  clonedTasks.sort((a, b) => a.id - b.id);

  // Sorting sorts the clone only
  expect(store.tasks[0]).toBe(clonedTasks[2]);

  clonedTasks[2].name = 'Task 2 (modified)';

  // Recollect v4 used to update based on path, so the below would fail
  // This test asserts that path doesn't matter
  expect(store.tasks[0].name).toBe('Task 2 (modified)');
  expect(store.tasks[1].name).toBe('Task 1');
  expect(store.tasks[2].name).toBe('Task 0');

  expect(clonedTasks[0].name).toBe('Task 0');
  expect(clonedTasks[1].name).toBe('Task 1');
  expect(clonedTasks[2].name).toBe('Task 2 (modified)');

  store.tasks.sort((a, b) => a.id - b.id);

  expect(store.tasks[0].name).toBe('Task 0');
  expect(store.tasks[1].name).toBe('Task 1');
  expect(store.tasks[2].name).toBe('Task 2 (modified)');

  expect(clonedTasks[0].name).toBe('Task 0');
  expect(clonedTasks[1].name).toBe('Task 1');
  expect(clonedTasks[2].name).toBe('Task 2 (modified)');
});
