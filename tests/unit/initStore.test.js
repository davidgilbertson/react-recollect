import { store, initStore } from 'src';

it('should replace the contents of the store', () => {
  store.propertyOne = 'the first property';
  expect(store.propertyOne).toBe('the first property');

  initStore({
    propertyTwo: 'the second property',
  });

  expect(store.propertyOne).toBeUndefined();
  expect(store.propertyTwo).toBe('the second property');
});
