import { store, afterChange } from '../../dist';

const handleChange = jest.fn();
afterChange(handleChange);

afterEach(() => {
  handleChange.mockClear();
});

it('should only update the items that change', () => {
  store.tasks = [
    { name: 'task 0', done: true },
    { name: 'task 1', done: false },
    { name: 'task 2', done: true },
    { name: 'task 3', done: false },
  ];

  handleChange.mockClear();

  // Simulate marking all tasks as done
  store.tasks.forEach(task => {
    task.done = true;
  });

  // But two tasks were already done so shouldn't trigger an update
  // So only two should actually trigger an update
  expect(handleChange).toHaveBeenCalledTimes(2);

  const changeEvent1 = handleChange.mock.calls[0][0];
  const changeEvent2 = handleChange.mock.calls[1][0];

  expect(changeEvent1.propPath).toBe('store.tasks.1.done');
  expect(changeEvent2.propPath).toBe('store.tasks.3.done');
});

it('should ignore adding undefined', () => {
  store.newUndefined = undefined;

  expect(handleChange).toHaveBeenCalledTimes(0);
});
