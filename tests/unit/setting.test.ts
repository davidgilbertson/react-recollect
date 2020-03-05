import { store, afterChange, initStore } from '../../src';
import { propPathChanges, TaskType } from '../testUtils';

declare module '../../src' {
  interface Store {
    // Add a few things used in this file
    longArrayToCompareSort?: TaskType[];
    shortArrayToCompareSort?: TaskType[];
  }
}

const handleChange = jest.fn();
afterChange(handleChange);

afterEach(() => {
  initStore(); // empty the store

  handleChange.mockClear();
});

it('should add a string', () => {
  store.newString = 'test';
  expect(handleChange).toHaveBeenCalledTimes(1);

  const changeEvent = handleChange.mock.calls[0][0];
  expect(changeEvent.store.newString).toBe('test');
});

it('should add null', () => {
  store.newNull = null;
  expect(handleChange).toHaveBeenCalledTimes(1);

  const changeEvent = handleChange.mock.calls[0][0];
  expect(changeEvent.store.newNull).toBe(null);
});

it('should add an object', () => {
  store.newObject = {
    someProp: 'someValue',
  };
  expect(handleChange).toHaveBeenCalledTimes(1);

  const changeEvent = handleChange.mock.calls[0][0];
  expect(changeEvent.store.newObject).toEqual(
    expect.objectContaining({
      someProp: 'someValue',
    })
  );
});

it('should allow uncommon prop types', () => {
  store.interestingObject = {
    level1: {},
  };
  store.interestingObject.level1[0] = 'numeric key';
  const sym = Symbol('My symbol');
  store.interestingObject.level1[sym] = 'symbol key';

  expect(propPathChanges(handleChange)).toEqual([
    'interestingObject',
    'interestingObject.level1.0',
    'interestingObject.level1.Symbol(My symbol)',
  ]);
  expect(handleChange).toHaveBeenCalledTimes(3);
});

it('should add an array', () => {
  store.newArray = [];
  expect(handleChange).toHaveBeenCalledTimes(1);

  const changeEvent = handleChange.mock.calls[0][0];
  expect(changeEvent.store.newArray).toEqual([]);
});

it('should add an array with numbers', () => {
  store.newArray = [1];
  expect(handleChange).toHaveBeenCalledTimes(1);

  const changeEvent = handleChange.mock.calls[0][0];
  expect(changeEvent.store.newArray).toEqual([1]);
});

it("should add an array that's a real mixed bag", () => {
  store.newMixedArray = [
    1,
    2,
    undefined,
    null,
    'cats',
    false,
    true,
    { prop: 'val' },
  ];
  expect(handleChange).toHaveBeenCalledTimes(1);

  const changeEvent = handleChange.mock.calls[0][0];
  expect(changeEvent.store.newMixedArray).toEqual([
    1,
    2,
    undefined,
    null,
    'cats',
    false,
    true,
    { prop: 'val' },
  ]);
});

it('should update an item in an array', () => {
  store.arrToUpdate = [1, 2, 3];
  store.arrToUpdate[1] = 'cats';

  expect(store.arrToUpdate).toEqual([1, 'cats', 3]);
  expect(propPathChanges(handleChange)).toEqual([
    'arrToUpdate',
    'arrToUpdate.1',
  ]);
});

it('should update an object in an array', () => {
  store.arrToDeepUpdate = [
    { name: 'David' },
    { name: 'Erica' },
    { name: 'Sam' },
  ];
  store.arrToDeepUpdate[1].name = 'Kerry';

  expect(store.arrToDeepUpdate[1].name).toEqual('Kerry');
  expect(propPathChanges(handleChange)).toEqual([
    'arrToDeepUpdate',
    'arrToDeepUpdate.1.name',
  ]);
});

it('should delete a string', () => {
  store.deletionTest = {
    animal: 'cat',
    name: {
      first: 'Professor',
      last: 'Everywhere',
    },
  };
  delete store.deletionTest.name;

  expect(store.deletionTest).toHaveProperty('animal');
  expect(store.deletionTest).not.toHaveProperty('name');

  expect(propPathChanges(handleChange)).toEqual([
    'deletionTest',
    'deletionTest.name',
  ]);
});

it('should perform read operations without triggering changes', () => {
  store.arrayToRead = [1, 2, 3, 4];
  handleChange.mockReset();

  expect(store.arrayToRead.find((item: number) => item > 2)).toBe(3);
  expect(store.arrayToRead.findIndex((item: number) => item > 2)).toBe(2);
  expect(store.arrayToRead.concat([5, 6])).toEqual([1, 2, 3, 4, 5, 6]);
  expect(store.arrayToRead.join('~')).toBe('1~2~3~4');
  expect(store.arrayToRead.toString()).toBe('1,2,3,4');
  expect(store.arrayToRead.indexOf(2)).toBe(1);
  expect(store.arrayToRead.lastIndexOf(2)).toBe(1);
  expect(store.arrayToRead.includes(2)).toBe(true);
  expect(store.arrayToRead.includes(22)).toBe(false);
  expect(store.arrayToRead.slice()).not.toBe(store.arrayToRead);

  // None of these should trigger a change
  expect(handleChange).not.toHaveBeenCalled();
});

/*  --  Mutating arrays  --  */
it('should push()', () => {
  store.emptyArray = [];
  store.emptyArray.push(77);

  expect(store.emptyArray[0]).toBe(77);
  expect(propPathChanges(handleChange)).toEqual([
    'emptyArray',
    // push() calls set with the new item, then sets the length
    'emptyArray.0',
    'emptyArray.length',
  ]);
});

it('should sort()', () => {
  store.arrayToSort = [3, 4, 2, 1];
  store.arrayToSort.sort();

  expect(store.arrayToSort).toEqual([1, 2, 3, 4]);
  // We don't know the order or these (in practice, Node 10 is different to Node 12)
  expect(propPathChanges(handleChange)).toEqual(
    expect.arrayContaining([
      'arrayToSort',
      'arrayToSort.0',
      'arrayToSort.1',
      'arrayToSort.2',
      'arrayToSort.3',
    ])
  );

  // Sorting with a compare function fails in < V8 7.0. (Node 10)
  // So we disable the test for older versions, for now.
  // Fix in https://github.com/davidgilbertson/react-recollect/issues/71
  if (parseInt(process.versions.v8, 10) >= 7) {
    // V8 uses a different algorithm for < and > 10 items
    // So we test both
    store.longArrayToCompareSort = [
      { id: 3, name: 'Task 3' },
      { id: 4, name: 'Task 4' },
      { id: 11, name: 'Task 11' },
      { id: 2, name: 'Task 2' },
      { id: 1, name: 'Task 1' },
      { id: 5, name: 'Task 5' },
      { id: 10, name: 'Task 10' },
      { id: 6, name: 'Task 6' },
      { id: 7, name: 'Task 7' },
      { id: 8, name: 'Task 8' },
      { id: 9, name: 'Task 9' },
      { id: 12, name: 'Task 12' },
    ];

    store.longArrayToCompareSort.sort((a, b) => a.id - b.id);

    expect(store.longArrayToCompareSort).toEqual([
      { id: 1, name: 'Task 1' },
      { id: 2, name: 'Task 2' },
      { id: 3, name: 'Task 3' },
      { id: 4, name: 'Task 4' },
      { id: 5, name: 'Task 5' },
      { id: 6, name: 'Task 6' },
      { id: 7, name: 'Task 7' },
      { id: 8, name: 'Task 8' },
      { id: 9, name: 'Task 9' },
      { id: 10, name: 'Task 10' },
      { id: 11, name: 'Task 11' },
      { id: 12, name: 'Task 12' },
    ]);

    store.shortArrayToCompareSort = [
      { id: 3, name: 'Task 3' },
      { id: 4, name: 'Task 4' },
      { id: 2, name: 'Task 2' },
      { id: 1, name: 'Task 1' },
    ];

    store.shortArrayToCompareSort.sort((a, b) => a.id - b.id);

    expect(store.shortArrayToCompareSort).toEqual([
      { id: 1, name: 'Task 1' },
      { id: 2, name: 'Task 2' },
      { id: 3, name: 'Task 3' },
      { id: 4, name: 'Task 4' },
    ]);
  } else {
    console.warn(
      `Skipping the array.sort() test for V8 ${process.versions.v8}`
    );
  }
});

it('should pop()', () => {
  store.arrayToPop = [3, 4, 2, 1];
  const popped = store.arrayToPop.pop();

  expect(popped).toBe(1);
  expect(store.arrayToPop).toEqual([3, 4, 2]);
  expect(propPathChanges(handleChange)).toEqual([
    'arrayToPop',
    'arrayToPop.3', // fired as deleteProperty()
    'arrayToPop.length',
  ]);
});

it('should reverse()', () => {
  store.arrayToReverse = [3, 4, 2, 1];
  const newArray = store.arrayToReverse.reverse();

  expect(newArray).toEqual([1, 2, 4, 3]);
  expect(store.arrayToReverse).toEqual([1, 2, 4, 3]);
  expect(propPathChanges(handleChange)).toEqual([
    'arrayToReverse',
    'arrayToReverse.0',
    'arrayToReverse.3', // fires in weird order, but whatever
    'arrayToReverse.1',
    'arrayToReverse.2',
  ]);
});

it('should fill()', () => {
  store.arrayToFill = [1, 2, 3, 4];
  const newArray = store.arrayToFill.fill('x', 0, 2);

  expect(newArray).toEqual(['x', 'x', 3, 4]);
  expect(store.arrayToFill).toEqual(['x', 'x', 3, 4]);
  expect(propPathChanges(handleChange)).toEqual([
    'arrayToFill',
    'arrayToFill.0',
    'arrayToFill.1',
  ]);
});

// TODO (davidg): this doesn't fail gracefully. E.g. copyWithin(0, 2, 2) errors hard
it('should copyWithin()', () => {
  store.arrayToCopyWithin = [1, 2, 3, 4];
  const newArray = store.arrayToCopyWithin.copyWithin(0, 2, 4);

  expect(newArray).toEqual([3, 4, 3, 4]);
  expect(store.arrayToCopyWithin).toEqual([3, 4, 3, 4]);
  expect(propPathChanges(handleChange)).toEqual([
    'arrayToCopyWithin',
    'arrayToCopyWithin.0',
    'arrayToCopyWithin.1',
  ]);
});

it('should shift()', () => {
  store.arrayToShift = [1, 2, 3, 4];
  const removedItem = store.arrayToShift.shift();

  expect(removedItem).toBe(1);
  expect(store.arrayToShift).toEqual([2, 3, 4]);
  expect(propPathChanges(handleChange)).toEqual([
    'arrayToShift',
    'arrayToShift.0',
    'arrayToShift.1',
    'arrayToShift.2',
    'arrayToShift.3',
    'arrayToShift.length',
  ]);
});

it('should splice()', () => {
  store.arrayToSplice = [1, 2, 3, 4];
  const spliced = store.arrayToSplice.splice(1, 2);

  expect(spliced).toEqual([2, 3]);
  expect(store.arrayToSplice).toEqual([1, 4]);
  expect(propPathChanges(handleChange)).toEqual([
    'arrayToSplice',
    'arrayToSplice.1',
    'arrayToSplice.3',
    'arrayToSplice.2',
    'arrayToSplice.length',
  ]);
});

it('should unshift()', () => {
  store.arrayToUnshift = [1, 2, 3, 4];
  const newLength = store.arrayToUnshift.unshift('a', 'b');

  expect(newLength).toBe(6);
  expect(store.arrayToUnshift).toEqual(['a', 'b', 1, 2, 3, 4]);
  expect(propPathChanges(handleChange)).toEqual([
    'arrayToUnshift',
    'arrayToUnshift.5',
    'arrayToUnshift.4',
    'arrayToUnshift.3',
    'arrayToUnshift.2',
    'arrayToUnshift.0',
    'arrayToUnshift.1',
    'arrayToUnshift.length',
  ]);
});

it('should not allow setting of a deleted thing', () => {
  store.test = {
    animal: 'cat',
    name: 'Steven2',
  };

  delete store.test;

  handleChange.mockClear();

  expect(() => {
    store.test.animal = 'dog';
  }).toThrowError();

  expect(handleChange).toHaveBeenCalledTimes(0);
});

it('calls listeners with the changed path', () => {
  store.deepObject = {
    objectProp: {
      arr: [
        1,
        2,
        {
          name: 'David',
        },
      ],
    },
  };

  // Doesn't matter how the item is referenced
  const { arr } = store.deepObject.objectProp;
  const secondItem = arr[2];
  secondItem.name = 'Sam';

  expect(propPathChanges(handleChange)).toEqual([
    'deepObject',
    'deepObject.objectProp.arr.2.name',
  ]);
});

it('should handle deep Maps', () => {
  const taskList: TaskType[] = [
    {
      id: 0,
      name: 'Task zero',
      done: false,
    },
    {
      id: 1,
      name: 'Task one',
      done: false,
    },
  ];

  store.deepMap = new Map([['taskList', taskList]]);

  store.deepMap.get('taskList')[1].done = true;

  expect(propPathChanges(handleChange)).toEqual([
    'deepMap',
    // TODO (davidg): 'taskList' should not be in the path.
    //  It's fine if it's a string, but what if it's an object? The
    //  reference will be lost when the map is clone (and actually, even if
    //  it isn't, it would be for the set).
    'deepMap.taskList.1.done',
  ]);
});

it('should handle Sets', () => {
  store.set = new Set([
    {
      id: 0,
      name: 'Task zero',
      done: false,
    },
    {
      id: 1,
      name: 'Task one',
      done: false,
    },
  ]);

  store.set.forEach((task: TaskType) => {
    // eslint-disable-next-line no-param-reassign
    task.done = true;
  });

  expect(propPathChanges(handleChange)).toEqual([
    'set',
    // TODO (davidg): clearly this is not ideal
    'set.[object Object].done',
    'set.[object Object].done',
  ]);
});
