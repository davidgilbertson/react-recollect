import * as utils from '../../src/shared/utils';

it('should update deep', () => {
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
  };

  const paths: any[] = [];

  utils.updateDeep(data, (item: any, path: any[]) => {
    paths.push(path);
  });

  expect(paths).toEqual([
    [],
    ['level1'],
    ['level1', 0],
    ['level1', 0, 'name'],
    ['level1', 0, 'data'],
    ['level1', 0, 'data', 'done'],
    ['level1', 0, 'data', 'date'],
    ['level1', 1],
    ['level1', 1, 'name'],
    ['level1', 1, 'data'],
    ['level1', 1, 'data', 'done'],
    ['level1', 1, 'data', 'date'],
    ['level2'],
    ['level2', 'deep'],
    ['level2', 'deep', 'data'],
  ]);
});

it('should create a full clone', () => {
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
  };

  const clone = utils.updateDeep(data, utils.clone);

  expect(clone).toEqual(data);
  expect(clone).not.toBe(data);
  expect(clone.level1).not.toBe(data.level1);
  expect(clone.level1[0]).not.toBe(data.level1[0]);
  expect(clone.level1[0].data).not.toBe(data.level1[0].data);
});
