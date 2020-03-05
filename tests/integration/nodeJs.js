/**
 * This test suite runs outside of Jest/JSDOM to properly represent
 * then Node.js environment
 */
const assert = require('assert');
const { store, afterChange } = require('../../dist');

// Very sophisticated test framework.
const test = (name, func) => {
  try {
    func();
  } catch (err) {
    console.error(name, err);
  }
};

test('The store should work without `window` present', () => {
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

test('should trigger afterChange', () => {
  const changes = [];

  afterChange((e) => {
    changes.push(e.changedProps[0]);
  });

  store.prop1 = {};
  store.prop1.prop2 = {};
  store.prop1.prop2.foo = 'bar';

  assert.deepStrictEqual(changes, ['prop1', 'prop1.prop2', 'prop1.prop2.foo']);
});
