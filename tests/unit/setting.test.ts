import { store, afterChange, initStore } from '../../src';
import { propPathChanges, TaskType } from '../testUtils';

declare module '../../src' {
  interface Store {
    // Add a few things used in this file
    taskList?: TaskType[];
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

it('should Object.assign() just fine', () => {
  store.level1 = {
    level2: 'text',
  };

  Object.assign(store.level1, {
    level2B: 'new text',
  });

  expect(store).toEqual({
    level1: {
      level2: 'text',
      level2B: 'new text',
    },
  });

  Object.assign(store.level1, {
    level2: 'new text',
  });

  expect(store).toEqual({
    level1: {
      level2: 'new text',
      level2B: 'new text',
    },
  });

  Object.assign(store, {
    level1B: 'new text',
  });

  expect(store).toEqual({
    level1: {
      level2: 'new text',
      level2B: 'new text',
    },
    level1B: 'new text',
  });
});

it('should allow uncommon prop types', () => {
  store.interestingObject = {
    level1: {},
  };
  store.interestingObject.level1[0] = 'numeric key';
  const sym = Symbol('My symbol');
  store.interestingObject.level1[sym] = 'symbol key';

  expect(propPathChanges(handleChange)).toEqual([
    '',
    'interestingObject.level1',
    'interestingObject.level1.Symbol(My symbol)',
  ]);
  expect(handleChange).toHaveBeenCalledTimes(3);
});

it('should allow prop types that are methods', () => {
  // There is logic with special treatment for methods. We want to make sure
  // this doesn't interfere with reading good old property names on an object.
  store.methodNames = {
    // Array mutator methods
    copyWithin: { foo: 'copyWithin' },
    fill: { foo: 'fill' },
    pop: { foo: 'pop' },
    push: { foo: 'push' },
    reverse: { foo: 'reverse' },
    shift: { foo: 'shift' },
    sort: { foo: 'sort' },
    splice: { foo: 'splice' },
    unshift: { foo: 'unshift' },

    // Array read methods
    concat: { foo: 'concat' },
    includes: { foo: 'includes' },
    indexOf: { foo: 'indexOf' },
    join: { foo: 'join' },
    lastIndexOf: { foo: 'lastIndexOf' },
    slice: { foo: 'slice' },
    toSource: { foo: 'toSource' },
    toString: { foo: 'toString' },
    toLocaleString: { foo: 'toLocaleString' },

    // Array props
    length: { foo: 'length' },

    // Map and set mutator methods
    add: { foo: 'add' },
    clear: { foo: 'clear' },
    delete: { foo: 'delete' },
    set: { foo: 'set' },

    // Map and set read methods
    entries: { foo: 'entries' },
    forEach: { foo: 'forEach' },
    get: { foo: 'get' },
    has: { foo: 'has' },
    keys: { foo: 'keys' },
    values: { foo: 'values' },

    // Map and set prop
    size: { foo: 'size' },
  };

  expect(store.methodNames.copyWithin.foo).toBe('copyWithin');
  expect(store.methodNames.fill.foo).toBe('fill');
  expect(store.methodNames.pop.foo).toBe('pop');
  expect(store.methodNames.push.foo).toBe('push');
  expect(store.methodNames.reverse.foo).toBe('reverse');
  expect(store.methodNames.shift.foo).toBe('shift');
  expect(store.methodNames.sort.foo).toBe('sort');
  expect(store.methodNames.splice.foo).toBe('splice');
  expect(store.methodNames.unshift.foo).toBe('unshift');
  expect(store.methodNames.concat.foo).toBe('concat');
  expect(store.methodNames.includes.foo).toBe('includes');
  expect(store.methodNames.indexOf.foo).toBe('indexOf');
  expect(store.methodNames.join.foo).toBe('join');
  expect(store.methodNames.lastIndexOf.foo).toBe('lastIndexOf');
  expect(store.methodNames.slice.foo).toBe('slice');
  expect(store.methodNames.toSource.foo).toBe('toSource');
  expect(store.methodNames.toString.foo).toBe('toString');
  expect(store.methodNames.toLocaleString.foo).toBe('toLocaleString');
  expect(store.methodNames.length.foo).toBe('length');
  expect(store.methodNames.set.foo).toBe('set');
  expect(store.methodNames.add.foo).toBe('add');
  expect(store.methodNames.delete.foo).toBe('delete');
  expect(store.methodNames.clear.foo).toBe('clear');
  expect(store.methodNames.entries.foo).toBe('entries');
  expect(store.methodNames.forEach.foo).toBe('forEach');
  expect(store.methodNames.get.foo).toBe('get');
  expect(store.methodNames.has.foo).toBe('has');
  expect(store.methodNames.keys.foo).toBe('keys');
  expect(store.methodNames.values.foo).toBe('values');
  expect(store.methodNames.size.foo).toBe('size');
});

it('should allow dates', () => {
  const dateObject = new Date('2007-07-07T07:07:07');
  store.data = {
    dateObject,
    foo: 'bar',
  };

  const date = store.data.dateObject;
  store.data.foo = 'baz';
  expect(date).toBe(dateObject);
});

it('should allow regex', () => {
  const regExLiteral = /(.*)\.js$/;
  store.data = {
    regExLiteral,
    foo: 'bar',
  };

  const regEx = store.data.regExLiteral;
  store.data.foo = 'baz';
  expect(regEx).toBe(regExLiteral);
  expect('filename.js'.match(store.data.regExLiteral)![1]).toBe('filename');
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
  expect(propPathChanges(handleChange)).toEqual(['', 'arrToUpdate.1']);
});

it('should update an object in an array', () => {
  store.arrToDeepUpdate = [
    { name: 'David' },
    { name: 'Erica' },
    { name: 'Sam' },
  ];
  store.arrToDeepUpdate[1].name = 'Kerry';

  expect(store.arrToDeepUpdate[1].name).toEqual('Kerry');
  expect(propPathChanges(handleChange)).toEqual(['', 'arrToDeepUpdate.1.name']);
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

  expect(propPathChanges(handleChange)).toEqual(['', 'deletionTest']);
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
it('should sort()', () => {
  store.arrayToSort = [3, 4, 2, 1];
  store.arrayToSort.sort();

  expect(store.arrayToSort).toEqual([1, 2, 3, 4]);
  // We don't know the order or these (in practice, Node 10 is different to Node 12)
  expect(propPathChanges(handleChange)).toEqual(
    expect.arrayContaining(['arrayToSort'])
  );

  // V8 uses a different algorithm for < and > 10 items, so we test both
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
});

it('should update the paths in a sorted array', () => {
  store.taskList = [
    { id: 3, name: 'Task 3' },
    { id: 4, name: 'Task 4' },
    { id: 2, name: 'Task 2' },
    { id: 1, name: 'Task 1' },
  ];
  const { taskList } = store;

  taskList.sort((a, b) => a.id - b.id);

  jest.resetAllMocks();

  // Check the sort works
  expect(taskList[0].id).toBe(1);

  taskList[0].name = 'A new name';

  expect(propPathChanges(handleChange)).toEqual(['taskList.0.name']);
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
    '',
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
    '',
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
    '',
    // TODO (davidg): clearly this is not ideal
    'set.[object Object].done',
    'set.[object Object].done',
  ]);
});
