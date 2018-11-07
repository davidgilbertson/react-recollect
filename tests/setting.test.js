import { store, afterChange } from '../src';

describe('Changing the store', () => {
  const handleChange = jest.fn();
  afterChange(handleChange);

  afterEach(() => {
    handleChange.mockClear();
  });

  it('should add a string', () => {
    store.newString = 'test';
    expect(handleChange).toHaveBeenCalledTimes(1);

    const newStore = handleChange.mock.calls[0][0];
    expect(newStore.newString).toBe('test');
  });

  it('should add null', () => {
    store.newNull = null;
    expect(handleChange).toHaveBeenCalledTimes(1);

    const newStore = handleChange.mock.calls[0][0];
    expect(newStore.newNull).toBe(null);
  });

  it('should add undefined', () => {
    store.newUndefined = undefined;
    expect(handleChange).toHaveBeenCalledTimes(1);

    const newStore = handleChange.mock.calls[0][0];
    expect(newStore.newUndefined).toBe(undefined);
  });

  it('should add an object', () => {
    store.newObject = {
      someProp: 'someValue',
    };
    expect(handleChange).toHaveBeenCalledTimes(1);

    const newStore = handleChange.mock.calls[0][0];
    expect(newStore.newObject).toEqual(expect.objectContaining({
      someProp: 'someValue',
    }));
  });

  it('should add an array', () => {
    store.newArray = [];
    expect(handleChange).toHaveBeenCalledTimes(1);

    const newStore = handleChange.mock.calls[0][0];
    expect(newStore.newArray).toEqual([]);
  });

  it('should add an array with numbers', () => {
    store.newArray = [1];
    expect(handleChange).toHaveBeenCalledTimes(1);

    const newStore = handleChange.mock.calls[0][0];
    expect(newStore.newArray).toEqual([1]);
  });

  it('should add an array that\'s a real mixed bag', () => {
    store.newMixedArray = [1, 2, undefined, null, 'cats', false, true, { prop: 'val'} ];
    expect(handleChange).toHaveBeenCalledTimes(1);

    const newStore = handleChange.mock.calls[0][0];
    expect(newStore.newMixedArray).toEqual([1, 2, undefined, null, 'cats', false, true, { prop: 'val'} ]);
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

  // it('should not allow setting of a deleted thing', () => {
  //   store.test = {
  //     animal: 'cat',
  //     name: 'Steven2',
  //   };
  //
  //   delete store.test;
  //
  //   handleChange.mockClear();
  //
  //   expect(() => {
  //     store.test.animal = 'dog';
  //   }).toThrowError();
  //
  //   expect(handleChange).toHaveBeenCalledTimes(0);
  // });

  // it('calls listeners with the changed path', () => {
  //   store.test = {
  //     objectProp: {
  //       arr: [
  //         1,
  //         2,
  //         {
  //           name: 'David',
  //         },
  //       ],
  //     },
  //   };
  //
  //   handleChange.mockClear();
  //
  //   // Doesn't matter how the item is referenced, obviously
  //   const { arr } = store.test.objectProp;
  //   const secondItem = arr[2];
  //   secondItem.name = 'Sam';
  //
  //   expect(handleChange).toHaveBeenCalledTimes(1);
  //   expect(handleChange.mock.calls[0][1]).toBe('store.test.objectProp.arr.2.name');
  // });
});
