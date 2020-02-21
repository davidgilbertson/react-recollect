import { store, initStore } from 'src';
import state from 'src/shared/state';

it('should replace the contents of the store', () => {
  store.propertyOne = 'the first property';
  expect(store.propertyOne).toBe('the first property');

  initStore({
    propertyTwo: 'the second property',
  });

  expect(store.propertyOne).toBeUndefined();
  expect(store.propertyTwo).toBe('the second property');

  expect(store).toEqual({
    propertyTwo: 'the second property',
  });
});

it('should be impossible to get out of sync', () => {
  // In all cases, the set will be intercepted, directed to the nextStore
  // then copied into the store

  // Set the global store, as exported to the user
  store.exportedStore = 'two';
  expect(state.nextStore.exportedStore).toBe('two');
  expect(state.store.exportedStore).toBe('two');

  // Set the internal store. Should never be done, but is redirected
  state.store.internalStore = 'one';
  expect(state.nextStore.internalStore).toBe('one');
  expect(state.store.internalStore).toBe('one');

  // Set the nextStore, the object exposed as `store` in collected components
  state.nextStore.internalNextStore = 'one';
  expect(state.nextStore.internalNextStore).toBe('one');
  expect(state.store.internalNextStore).toBe('one');
});
