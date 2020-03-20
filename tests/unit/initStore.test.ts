import { store, initStore } from '../..';

it('should replace the contents of the store', () => {
  store.propertyOne = 'the first property';
  expect(store.propertyOne).toBe('the first property');

  initStore({
    propertyTwo: 'the second property',
  });

  expect(store.propertyOne).toBeUndefined();
  expect(store.propertyTwo).toBe('the second property');

  expect(store).toEqual(
    expect.objectContaining({
      propertyTwo: 'the second property',
    })
  );
});
