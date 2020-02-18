import { store, afterChange, initStore } from '../../dist';

const handleChange = jest.fn();
afterChange(handleChange);

const propPathChanges = handleChangeMock => handleChangeMock.mock.calls.map(call => call[0].propPath);

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
  expect(changeEvent.store.newObject).toEqual(expect.objectContaining({
    someProp: 'someValue',
  }));
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

it('should add an array that\'s a real mixed bag', () => {
  store.newMixedArray = [1, 2, undefined, null, 'cats', false, true, { prop: 'val'} ];
  expect(handleChange).toHaveBeenCalledTimes(1);

  const changeEvent = handleChange.mock.calls[0][0];
  expect(changeEvent.store.newMixedArray).toEqual([1, 2, undefined, null, 'cats', false, true, { prop: 'val'} ]);
});

it('should update an item in an array', () => {
  store.arrToUpdate = [1, 2, 3];
  store.arrToUpdate[1] = 'cats';

  expect(store.arrToUpdate).toEqual([1, 'cats', 3]);
  expect(propPathChanges(handleChange)).toEqual([
    'store.arrToUpdate',
    'store.arrToUpdate.1',
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
    'store.arrToDeepUpdate',
    'store.arrToDeepUpdate.1.name',
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
    'store.deletionTest',
    'store.deletionTest.name',
  ]);
});


it('should perform read operations without triggering changes', () => {
  store.arrayToRead = [1, 2, 3, 4];
  handleChange.mockReset();

  expect(store.arrayToRead.find(item => item > 2)).toBe(3);
  expect(store.arrayToRead.findIndex(item => item > 2)).toBe(2);
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
    'store.emptyArray',
    // push() calls set with the new item, then sets the length
    'store.emptyArray.0',
    'store.emptyArray.length',
  ]);
});

it('should sort()', () => {
  store.arrayToSort = [3, 4, 2, 1];
  store.arrayToSort.sort();

  expect(store.arrayToSort).toEqual([1, 2, 3, 4]);
  // We don't know the order or these (in practice, Node 10 is different to Node 12)
  expect(propPathChanges(handleChange)).toEqual(expect.arrayContaining([
    'store.arrayToSort',
    'store.arrayToSort.0',
    'store.arrayToSort.1',
    'store.arrayToSort.2',
    'store.arrayToSort.3',
  ]));
});

it('should pop()', () => {
  store.arrayToPop = [3, 4, 2, 1];
  const popped = store.arrayToPop.pop();

  expect(popped).toBe(1);
  expect(store.arrayToPop).toEqual([3, 4, 2]);
  expect(propPathChanges(handleChange)).toEqual([
    'store.arrayToPop',
    'store.arrayToPop.3', // fired as deleteProperty()
    'store.arrayToPop.length',
  ]);
});

it('should reverse()', () => {
  store.arrayToReverse = [3, 4, 2, 1];
  const newArray = store.arrayToReverse.reverse();

  expect(newArray).toEqual([1, 2, 4, 3]);
  expect(store.arrayToReverse).toEqual([1, 2, 4, 3]);
  expect(propPathChanges(handleChange)).toEqual([
    'store.arrayToReverse',
    'store.arrayToReverse.0',
    'store.arrayToReverse.3', // fires in weird order, but whatever
    'store.arrayToReverse.1',
    'store.arrayToReverse.2',
  ]);
});

it('should fill()', () => {
  store.arrayToFill = [1, 2, 3, 4];
  const newArray = store.arrayToFill.fill('x', 0, 2);

  expect(newArray).toEqual(['x', 'x', 3, 4]);
  expect(store.arrayToFill).toEqual(['x', 'x', 3, 4]);
  expect(propPathChanges(handleChange)).toEqual([
    'store.arrayToFill',
    'store.arrayToFill.0',
    'store.arrayToFill.1',
  ]);
});

// TODO (davidg): this doesn't fail gracefully. E.g. copyWithin(0, 2, 2) errors hard
it('should copyWithin()', () => {
  store.arrayToCopyWithin = [1, 2, 3, 4];
  const newArray = store.arrayToCopyWithin.copyWithin(0, 2, 4);

  expect(newArray).toEqual([3, 4, 3, 4]);
  expect(store.arrayToCopyWithin).toEqual([3, 4, 3, 4]);
  expect(propPathChanges(handleChange)).toEqual([
    'store.arrayToCopyWithin',
    'store.arrayToCopyWithin.0',
    'store.arrayToCopyWithin.1',
  ]);
});

it('should shift()', () => {
  store.arrayToShift = [1, 2, 3, 4];
  const removedItem = store.arrayToShift.shift();

  expect(removedItem).toBe(1);
  expect(store.arrayToShift).toEqual([2, 3, 4]);
  expect(propPathChanges(handleChange)).toEqual([
    'store.arrayToShift',
    'store.arrayToShift.0',
    'store.arrayToShift.1',
    'store.arrayToShift.2',
    'store.arrayToShift.3',
    'store.arrayToShift.length',
  ]);
});

it('should splice()', () => {
  store.arrayToSplice = [1, 2, 3, 4];
  const spliced = store.arrayToSplice.splice(1, 2);

  expect(spliced).toEqual([2, 3]);
  expect(store.arrayToSplice).toEqual([1, 4]);
  expect(propPathChanges(handleChange)).toEqual([
    'store.arrayToSplice',
    'store.arrayToSplice.1',
    'store.arrayToSplice.3',
    'store.arrayToSplice.2',
    'store.arrayToSplice.length',
  ]);
});

it('should unshift()', () => {
  store.arrayToUnshift = [1, 2, 3, 4];
  const newLength = store.arrayToUnshift.unshift('a', 'b');

  expect(newLength).toBe(6);
  expect(store.arrayToUnshift).toEqual(['a', 'b', 1, 2, 3, 4]);
  expect(propPathChanges(handleChange)).toEqual([
    'store.arrayToUnshift',
    'store.arrayToUnshift.5',
    'store.arrayToUnshift.4',
    'store.arrayToUnshift.3',
    'store.arrayToUnshift.2',
    'store.arrayToUnshift.0',
    'store.arrayToUnshift.1',
    'store.arrayToUnshift.length',
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
    'store.deepObject',
    'store.deepObject.objectProp.arr.2.name',
  ]);
});
