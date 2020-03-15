import { deepUpdate } from '../../src/shared/utils';
import { ObjWithSymbols, Target } from '../../src/shared/types';

it('should mutate the object', () => {
  const data = {
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

  const originalLevel1 = data.level1;
  const originalLevel1FirstData = data.level1[0].data;

  deepUpdate({
    mutableTarget: data,
    propPath: ['level1', 0, 'data'],
    afterClone: (a, b) => b,
    updater: (mutableTarget: Target) => {
      mutableTarget.done = false;
    },
  });

  expect(originalLevel1[0].data.done).toBe(true);
  expect(data.level1[0].data.done).toBe(false);

  // Cloned
  expect(data.level1).not.toBe(originalLevel1);
  expect(data.level1[0].data).not.toBe(originalLevel1FirstData);
});

it('should mutate a Map', () => {
  const data = {
    mapOne: new Map(),
    mapTwo: new Map(),
  };

  const originalMapOne = data.mapOne;

  data.mapOne.set('123', { id: 1, name: 'Task one' });
  data.mapOne.set(123, { id: 2, name: 'Task one (number key)' });
  data.mapOne.set('two', { id: 3, name: 'Task two' });

  deepUpdate({
    mutableTarget: data,
    propPath: ['mapOne', 123],
    afterClone: (a, b) => b,
    updater: (mutableTarget: Target) => {
      mutableTarget.name = 'A new name';
    },
  });

  expect(originalMapOne.get(123)!.name).toBe('Task one (number key)');
  expect(data.mapOne.get(123).name).toBe('A new name');

  // Cloned
  expect(data.mapOne).not.toBe(originalMapOne);
  expect(data.mapOne.get(123)).not.toBe(originalMapOne.get(123));

  // Not cloned
  expect(data.mapTwo).toBe(data.mapTwo);
  expect(data.mapOne.get('123')).toBe(data.mapOne.get('123'));
  expect(data.mapOne.get('two')).toBe(data.mapOne.get('two'));
});

it('should clone with a clone function', () => {
  const original = {
    mapOne: new Map(),
    mapTwo: new Map(),
  };

  original.mapOne.set('123', { name: 'Task one', done: true });
  original.mapOne.set(123, { name: 'Task one (number key)', done: false });
  original.mapOne.set('two', { name: 'Task two', done: true });

  deepUpdate({
    mutableTarget: original,
    propPath: ['mapOne', 123],
    updater: (mutableTarget: Target) => {
      mutableTarget.name = 'A new name';
    },
    afterClone: (_, mutableTarget: any) => {
      if (!mutableTarget.done) {
        mutableTarget.done = true;
      }
      return mutableTarget;
    },
  });

  expect(original.mapOne.get(123).name).toBe('A new name');
  expect(original.mapOne.get(123).done).toBe(true);
});
