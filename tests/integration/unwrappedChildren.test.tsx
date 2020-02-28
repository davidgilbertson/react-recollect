/**
 * Child components that render items in an array should not need to be wrapped in collect()
 */
import React from 'react';
import { render } from '@testing-library/react';
import { afterChange, collect, store as globalStore } from '../../src';

globalStore.tasks = [
  { name: 'task 0', done: false },
  { name: 'task 1', done: false },
];

const handleChange = jest.fn();
let taskListRenderCount = 0;
let taskRenderCount = 0;

afterChange(handleChange);

afterEach(() => {
  handleChange.mockClear();
});

type Props = {
  task: {
    done: boolean;
    name: string;
  };
};

const Task = React.memo(({ task }: Props) => {
  taskRenderCount++;

  return (
    <label>
      <input
        type="checkbox"
        checked={task.done}
        onChange={(e) => {
          // eslint-disable-next-line no-param-reassign
          task.done = e.target.checked;
        }}
      />

      {task.name}
    </label>
  );
});

const TaskList = ({ store }) => {
  taskListRenderCount++;

  return (
    <div>
      {store.tasks.map((task) => (
        <Task key={task.name} task={task} />
      ))}
    </div>
  );
};

const CollectedTaskList = collect(TaskList);

it('should update a parent component when a prop is changed on a child component', () => {
  const { getByText, getByLabelText } = render(<CollectedTaskList />);
  const getInputByLabelText = (text: string) =>
    getByLabelText(text) as HTMLInputElement;

  expect(taskListRenderCount).toBe(1);
  expect(taskRenderCount).toBe(2);

  getByText('task 0');

  expect(getInputByLabelText('task 0').checked).toBe(false);

  getByLabelText('task 0').click(); // in the <Task>

  const changeEvent = handleChange.mock.calls[0][0];
  expect(changeEvent.changedProps).toEqual(['tasks.0.done']);
  expect(changeEvent.renderedComponents[0]._name).toBe('TaskList');

  expect(taskListRenderCount).toBe(2);
  expect(taskRenderCount).toBe(3); // only one task should update

  expect(getInputByLabelText('task 0').checked).toBe(true);
});
