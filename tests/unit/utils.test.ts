import { deepUpdate } from '../../src/shared/utils';
import { ObjWithSymbols } from '../../src/shared/types';

it('should mutate the object', () => {
  const original = {
    level1: [
      {
        name: 'Task one',
        data: { done: true, date: 1234 },
      },
      {
        name: 'Task two',
        data: { done: true, date: 5678 },
      },
    ],
    level2: {
      deep: {
        data: 'the result',
      },
    },
  } as ObjWithSymbols;

  const clone = deepUpdate({
    object: original,
    path: ['level1', 0, 'data'],
    updater: (mutableTarget: any) => {
      mutableTarget.done = false;
    },
  });

  expect(original.level1[0].data.done).toBe(true);
  expect(clone.level1[0].data.done).toBe(false);

  // Cloned
  expect(clone).not.toBe(original);
  expect(clone.level1).not.toBe(original.level1);
  expect(clone.level1[0]).not.toBe(original.level1[0]);
  expect(clone.level1[0].data).not.toBe(original.level1[0].data);

  // Not cloned
  expect(clone.level1[1]).toBe(original.level1[1]);
  expect(clone.level1[1].data).toBe(original.level1[1].data);
  expect(clone.level2).toBe(original.level2);
});

it('should mutate a Map', () => {
  const original = {
    mapOne: new Map(),
    mapTwo: new Map(),
  };

  original.mapOne.set('123', { id: 1, name: 'Task one' });
  original.mapOne.set(123, { id: 2, name: 'Task one (number key)' });
  original.mapOne.set('two', { id: 3, name: 'Task two' });

  const clone = deepUpdate({
    object: original,
    path: ['mapOne', 123],
    updater: (mutableTarget: any) => {
      mutableTarget.name = 'A new name';
    },
  });

  expect(original.mapOne.get(123)!.name).toBe('Task one (number key)');
  expect(clone.mapOne.get(123).name).toBe('A new name');

  // Cloned
  expect(clone).not.toBe(original);
  expect(clone.mapOne).not.toBe(original.mapOne);
  expect(clone.mapOne.get(123)).not.toBe(original.mapOne.get(123));

  // Not cloned
  expect(clone.mapTwo).toBe(original.mapTwo);
  expect(clone.mapOne.get('123')).toBe(original.mapOne.get('123'));
  expect(clone.mapOne.get('two')).toBe(original.mapOne.get('two'));
});

it('should clone with a clone function', () => {
  const originalObj = {
    mapOne: new Map(),
    mapTwo: new Map(),
  };

  originalObj.mapOne.set('123', { name: 'Task one', done: true });
  originalObj.mapOne.set(123, { name: 'Task one (number key)', done: false });
  originalObj.mapOne.set('two', { name: 'Task two', done: true });

  const cloneObj = deepUpdate({
    object: originalObj,
    path: ['mapOne', 123],
    updater: (mutableTarget: any) => {
      mutableTarget.name = 'A new name';
    },
    onClone: (original, mutableTarget: any) => {
      if (!mutableTarget.done) {
        mutableTarget.done = true;
      }
      return mutableTarget;
    },
  });

  expect(originalObj.mapOne.get(123).name).toBe('Task one (number key)');
  expect(originalObj.mapOne.get(123).done).toBe(false);
  expect(cloneObj.mapOne.get(123).name).toBe('A new name');
  expect(cloneObj.mapOne.get(123).done).toBe(true);
});
