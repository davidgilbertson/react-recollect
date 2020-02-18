/**
 * Child components that render items in an array should not need to be wrapped in collect()
 */
import React from 'react';
import { render, prettyDOM } from '@testing-library/react';
import { afterChange, collect, store as globalStore } from '../../src';
import { debugOn } from '../../src/debug';

globalStore.tasks = [
  { name: 'task 0', done: true },
  { name: 'task 1', done: false },
];

const handleChange = jest.fn();
let taskListRenderCount = 0;
let taskRenderCount = 0;

afterChange(handleChange);

afterEach(() => {
  handleChange.mockClear();
});

const Task = React.memo(({ task }) => {
  taskRenderCount++;

  return (
    <label>
      <input
        type="checkbox"
        checked={task.done}
        onChange={(e) => {
          task.done = e.target.checked;
        }}
      />

      {task.name}
    </label>
  );
});

const TaskList = ({store}) => {
  taskListRenderCount++;

  return (
    <div>
      {store.tasks.map(task => (
        <Task key={task.name} task={task}/>
      ))}
    </div>
  );
};

const CollectedTaskList = collect(TaskList);

it('should update a parent component when a prop is changed on a child component', () => {
  const {getByText, getByLabelText} = render(<CollectedTaskList />);

  expect(taskListRenderCount).toBe(1);
  expect(taskRenderCount).toBe(2);

  getByText('task 0');

  expect(getByLabelText('task 0').checked).toBe(true);

  getByLabelText('task 0').click(); // in the <Task>
  expect(taskListRenderCount).toBe(2);
  expect(taskRenderCount).toBe(2); // only one should update // TODO (davidg): failing

  expect(handleChange.mock.calls[0][0].propPath).toBe('store.tasks.0.done');
  expect(handleChange.mock.calls[0][0].components[0]._name).toBe('TaskList');

  // TODO (davidg): this fails to render because of React.memo (I'm mutating the store)
  // expect(getByLabelText('task 0').checked).toBe(false);
});
