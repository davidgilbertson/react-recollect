/**
 * Child components that render items in an array should not need to be wrapped in collect()
 */
import React from 'react';
import { render } from 'react-testing-library';
import { afterChange, collect, store } from '../../dist';

store.tasks = [
  { name: 'task 0', done: false },
  { name: 'task 1', done: false },
];

const handleChange = jest.fn();
afterChange(handleChange);

afterEach(() => {
  handleChange.mockClear();
});

const Task = React.memo(({ task }) => (
  <label>
    <input
      type="checkbox"
      checked={task.done}
      onChange={(e) => task.done = e.target.checked}
    />

    {task.name}
  </label>
));

const TaskList = props => (
  <div>
    {props.store.tasks.map(task => (
      <Task key={task.name} task={task} />
    ))}
  </div>
);

const CollectedTaskList = collect(TaskList);

const { getByText, getByLabelText } = render(<CollectedTaskList />);

it('should update a parent component when a prop is changed on a child component', () => {
  getByText('task 0');

  expect(getByLabelText('task 0').checked).toBe(false);

  getByLabelText('task 0').click(); // in the <Task>

  expect(handleChange.mock.calls[0][0].propPath).toBe('store.tasks.0.done');
  expect(handleChange.mock.calls[0][0].components[0]._name).toBe('TaskList');

  expect(getByLabelText('task 0').checked).toBe(true);
});
