import React from 'react';
import { render } from '@testing-library/react';
import { collect } from '../../src';

const TestComponent = collect(({ store }) => (
  <div>
    {store.tasks && store.tasks.map(task => (
      <div key={task.name}>
        {task.name}
      </div>
    ))}

    {!!store.tasks || (
      <h1>You have no tasks</h1>
    )}

    <button
      onClick={() => {
        delete store.tasks;
      }}
    >Delete all tasks
    </button>

    <button
      onClick={() => {
        if (typeof store.tasks === 'undefined') {
          // set the store once
          store.tasks = [];
        }

        // expect tasks to be defined
        store.tasks.push({ name: 'A new task' });
      }}
    >
      Add a task
    </button>
  </div>
));

const { getByText } = render(<TestComponent />);

it('should allow the user to set the store twice in one callback without a re-render', () => {
  getByText('You have no tasks');

  // This click will do store.tasks = [], which is added to the nextStore
  // Immediately followed by store.tasks.push().
  // That second call should be routed to the next store
  getByText('Add a task').click();

  getByText('A new task');

  getByText('Delete all tasks').click();

  getByText('You have no tasks');

  getByText('Add a task').click();

  getByText('A new task');
});
