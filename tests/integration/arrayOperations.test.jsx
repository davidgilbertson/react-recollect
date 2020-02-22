/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { collect, store as globalStore } from 'src';

let renderCount;
let taskNumber;
let taskId;
const log = jest.fn();

beforeEach(() => {
  globalStore.tasks = [];
  renderCount = 0;
  taskNumber = 1;
  taskId = -1;
  log.mockReset();
});

const Task = props => <div>{props.task.name}</div>;

// eslint-disable-next-line react/prefer-stateless-function
class RawTaskList extends Component {
  render() {
    renderCount++;
    const { store } = this.props;

    return (
      <div>
        <button
          onClick={() => {
            store.tasks.push({
              id: taskId--, // we go backwards with IDs so that .sort() triggers a change
              name: `Task number ${taskNumber++}`,
            });
            log(store.tasks.length);
          }}
        >
          Add task
        </button>

        <button
          onClick={() => {
            store.tasks.pop();
          }}
        >
          Remove last task
        </button>

        <button
          onClick={() => {
            delete store.tasks;
          }}
        >
          Remove all tasks
        </button>

        {!!store.tasks && !!store.tasks.length && (
          <>
            <h1>Task list</h1>

            {store.tasks.map(task => (
              <Task task={task} key={task.id} />
            ))}
          </>
        )}
      </div>
    );
  }
}

const TaskList = collect(RawTaskList);

it('should operate on arrays', () => {
  const { getByText, queryByText } = render(<TaskList />);
  expect(renderCount).toBe(1);

  expect(queryByText('Task list')).toBeNull();

  // should handle adding an item to an array
  getByText('Add task').click();

  expect(renderCount).toBe(2);
  expect(getByText('Task list'));
  expect(getByText('Task number 1'));
  // Reading immediately should already have the new length property
  expect(log).toHaveBeenCalledWith(1);
  expect(globalStore.tasks.length).toBe(1);

  // should handle removing an item from an array
  getByText('Add task').click();
  getByText('Add task').click();
  expect(renderCount).toBe(4);

  expect(getByText('Task number 2'));
  expect(getByText('Task number 3'));

  getByText('Remove last task').click();
  expect(renderCount).toBe(5);

  expect(queryByText('Task number 3')).toBeNull();

  // should handle deleting an entire array
  expect(getByText('Task list'));

  getByText('Remove all tasks').click();
  expect(renderCount).toBe(6);

  expect(queryByText('Task list')).toBeNull();
});
