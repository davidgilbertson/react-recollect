/**
 * This test suite is a collection of the ways in which the Recollect store
 * behaves differently to a plain JavaScript object.
 */

import { store } from '../..';

it('will create a new object', () => {
  store.data = {
    foo: 'bar',
  };

  const originalData = store.data;

  store.data.foo = 'baz';

  // These two are now separate objects. This is required for React to work
  expect(originalData).not.toBe(store.data);

  // But when you read any value from them, they will contain the same data
  expect(originalData).toEqual(store.data);
  expect(originalData.foo).toEqual('baz');
  expect(store.data.foo).toEqual('baz');
});
