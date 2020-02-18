import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { collect, store as globalStore } from '../../src';

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

const Task = props => (
  <div>{props.task.name}</div>
);

class RawTaskList extends Component {
  render () {
    renderCount++;
    const {store} = this.props;

    return (
      <div>
        <button onClick={() => {
          store.tasks.push({
            id: taskId--, // we go backwards with IDs so that .sort() triggers a change
            name: `Task number ${taskNumber++}`,
          });
          log(store.tasks.length);
        }}>
          Add task
        </button>

        <button onClick={() => {
          store.tasks.sort((a, b) => a.id - b.id);
        }}>
          Sort tasks
        </button>

        <button onClick={() => {
          store.tasks.pop();
        }}>
          Remove last task
        </button>

        <button onClick={() => {
          delete store.tasks;
        }}>
          Remove all tasks
        </button>

        {!!store.tasks && !!store.tasks.length && (
          <React.Fragment>
            <h1>Task list</h1>

            {store.tasks.map(task => (
              <Task task={task} key={task.id} />
            ))}
          </React.Fragment>
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

it('should sort an array', () => {
  const { getByText } = render(<TaskList />);
  expect(renderCount).toBe(1);

  // should handle sorting an array
  getByText('Add task').click();
  getByText('Add task').click();
  getByText('Add task').click();
  expect(renderCount).toBe(4);

  getByText('Sort tasks').click();
  expect(renderCount).toBe(5);
  // Check everything is there, we don't actually know the order.
  expect(getByText('Task number 3'));
  expect(getByText('Task number 2'));
  expect(getByText('Task number 1'));
  expect(globalStore.tasks).toEqual([
    {id: -3, name: `Task number 3`},
    {id: -2, name: `Task number 2`},
    {id: -1, name: `Task number 1`},
  ]);

  // Should not change the second time
  getByText('Sort tasks').click();
  expect(renderCount).toBe(5);
});

// It should handle the fact that paths need to update (e.g. when store.tasks.1.done becomes
// store.tasks.0.done) in both they keys in the listeners AND the path prop/symbol on
// the item in the store.

// It should handle emptying an array with arr.length = 0;

// It should handle adding a deep object (and/or nested array) to an array
// (e.g. it needs to recursively wrap any object/array in new paths/proxies.

// It should handle multiple updates to the store. E.g. I have a component that starts with
// if (store.ready && store.tasks.length) ... then it is actually only listening to store.ready
// after the first render. See notes in updating.js where I was going to do batching.
