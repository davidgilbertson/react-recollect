/**
 * This test suite runs outside of Jest/JSDOM to properly represent
 * then Node.js environment
 */
const assert = require('assert');
const { store, afterChange } = require('../..');

// Very sophisticated test framework.
const runTest = (name, func) => {
  try {
    func();
  } catch (err) {
    throw Error(`${name}: ${err}`);
  }
};

runTest('The store should work without `window` present', () => {
  assert.equal(typeof window, 'undefined');

  store.anObject = {
    level1: {
      level2: 'level 2 text',
    },
  };

  assert.deepStrictEqual(store, {
    anObject: {
      level1: {
        level2: 'level 2 text',
      },
    },
  });

  // Now update things in the store
  store.anObject.level1.level2 = 'level 2 text!';

  assert.deepStrictEqual(store, {
    anObject: {
      level1: {
        level2: 'level 2 text!',
      },
    },
  });

  delete store.anObject;

  assert.deepStrictEqual(store, {});
});

runTest('should trigger afterChange', () => {
  const changes = [];

  afterChange((e) => {
    changes.push(e.changedProps[0]);
  });

  store.prop1 = {};
  store.prop1.prop2 = {};
  store.prop1.prop2.foo = 'bar';
  store.prop1.prop2.foo = 'baz';

  assert.deepStrictEqual(changes, [
    '',
    'prop1',
    'prop1.prop2',
    'prop1.prop2.foo',
  ]);
});
