import { store, afterChange } from '../..';

const handleChange = jest.fn();
afterChange(handleChange);

afterEach(() => {
  handleChange.mockClear();
});

it('should only update the items that change', () => {
  store.tasks = [
    { id: 0, name: 'task 0', done: true },
    { id: 1, name: 'task 1', done: false },
    { id: 2, name: 'task 2', done: true },
    { id: 3, name: 'task 3', done: false },
  ];

  handleChange.mockClear();

  // Simulate marking all tasks as done
  store.tasks.forEach((task) => {
    // eslint-disable-next-line no-param-reassign
    task.done = true;
  });

  // But two tasks were already done so shouldn't trigger an update
  // So only two should actually trigger an update
  expect(handleChange).toHaveBeenCalledTimes(2);

  const changeEvent1 = handleChange.mock.calls[0][0];
  const changeEvent2 = handleChange.mock.calls[1][0];

  expect(changeEvent1.changedProps).toEqual(['tasks.1.done']);
  expect(changeEvent2.changedProps).toEqual(['tasks.3.done']);
});

it('should ignore adding undefined', () => {
  store.newUndefined = undefined;

  expect(handleChange).toHaveBeenCalledTimes(0);
});
