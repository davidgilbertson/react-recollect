import React from 'react';
import { render } from 'react-testing-library';
import { collect } from '../../dist';

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

  getByText('Add a task').click();

  getByText('A new task');

  getByText('Delete all tasks').click();

  getByText('You have no tasks');

  getByText('Add a task').click();

  getByText('A new task');
});
