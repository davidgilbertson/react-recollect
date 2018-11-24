import { store, afterChange, initStore } from '../../dist';

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

it('should add undefined', () => {
  store.newUndefined = undefined;
  expect(handleChange).toHaveBeenCalledTimes(1);

  const changeEvent = handleChange.mock.calls[0][0];
  expect(changeEvent.store.newUndefined).toBe(undefined);
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

it('should update an object in an array', () => {
  store.arr = [
    { name: 'David' },
    { name: 'Erica' },
    { name: 'Sam' },
  ];

  handleChange.mockClear();

  store.arr[1].name = 'Kerry';

  expect(handleChange).toHaveBeenCalledTimes(1);

  expect(store.arr[1].name).toEqual('Kerry');
});

it('should update an item in an array', () => {
  store.arr = [1, 2, 3];

  handleChange.mockClear();

  store.arr[1] = 'cats';

  expect(handleChange).toHaveBeenCalledTimes(1);

  expect(store.arr).toEqual([1, 'cats', 3]);
});

it('should delete a string', () => {
  store.deletionTest = {
    animal: 'cat',
    name: {
      first: 'Professor',
      last: 'Everywhere',
    },
  };

  handleChange.mockClear();

  delete store.deletionTest.name;

  expect(handleChange).toHaveBeenCalledTimes(1);
  expect(store.deletionTest).toHaveProperty('animal');
  expect(store.deletionTest).not.toHaveProperty('name');
});

it('should set an empty array, then add items to the array', () => {
  store.emptyArray = [];

  handleChange.mockClear();

  store.emptyArray.push(1);

  expect(store.emptyArray[0]).toBe(1);
  // push() calls set with the new item, then sets the length
  expect(handleChange).toHaveBeenCalledTimes(2);

  expect(handleChange.mock.calls[0][0].propPath).toBe('store.emptyArray.0');
  expect(handleChange.mock.calls[1][0].propPath).toBe('store.emptyArray.length');
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
  store.test = {
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

  handleChange.mockClear();

  // Doesn't matter how the item is referenced, obviously
  const { arr } = store.test.objectProp;
  const secondItem = arr[2];
  secondItem.name = 'Sam';

  expect(handleChange).toHaveBeenCalledTimes(1);
  expect(handleChange.mock.calls[0][0].propPath).toBe('store.test.objectProp.arr.2.name');
});
