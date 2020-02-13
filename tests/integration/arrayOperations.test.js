import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { collect, store } from '../../dist';

const Task = props => (
  <div>{props.task.name}</div>
);

class RawTaskList extends Component {
  render () {
    return (
      <div>
        <button onClick={() => {
          if (!store.tasks) store.tasks = [];

          store.tasks.push({
            id: Math.random(),
            name: `Task number ${store.tasks.length + 1}`,
          });
        }}>
          Add task
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

it('should handle adding an item to an array', () => {
  const { getByText, queryByText } = render(<TaskList />);

  expect(queryByText('Task list')).toBeNull();

  getByText('Add task').click();

  expect(getByText('Task list'));
  expect(getByText('Task number 1'));
});

it('should handle removing an item from an array', () => {
  const { getByText, queryByText } = render(<TaskList />);

  getByText('Add task').click();
  getByText('Add task').click();

  expect(getByText('Task number 2'));
  expect(getByText('Task number 3'));

  getByText('Remove last task').click();

  expect(queryByText('Task number 3')).toBeNull();
});

it('should handle deleting an entire array', () => {
  const { getByText, queryByText } = render(<TaskList />);

  expect(getByText('Task list'));

  getByText('Remove all tasks').click();

  expect(queryByText('Task list')).toBeNull();
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
