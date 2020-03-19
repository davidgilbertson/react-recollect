import React from 'react';
import { collect, store as globalStore, WithStoreProp } from '../../src';
import * as testUtils from '../testUtils';

const TestComponent = collect(({ store }: WithStoreProp) => (
  <div>
    {store.tasks &&
      store.tasks.map((task) => <div key={task.name}>{task.name}</div>)}

    {!!store.tasks || <h1>You have no tasks</h1>}

    <button
      onClick={() => {
        delete store.tasks;
      }}
    >
      Delete all tasks
    </button>

    <button
      onClick={() => {
        if (typeof store.tasks === 'undefined') {
          // set the store once
          store.tasks = [];
        }

        // expect tasks to be defined
        store.tasks.push({
          name: 'A new task',
          id: Math.random(),
        });
      }}
    >
      Add a task
    </button>

    {!!store.page && (
      <>
        <button
          onClick={() => {
            store.page.status += '!';
            store.page.status += '!';
            store.page.status += '!';
          }}
        >
          Pump the jams
        </button>
        <div>{`Status: ${store.page.status}`}</div>
      </>
    )}
  </div>
));

it('should allow the user to set the store twice in one callback without a re-render', () => {
  const { getByText } = testUtils.renderStrict(<TestComponent />);
  getByText('You have no tasks');

  // This click will do store.tasks = [], which is added to the store
  // Immediately followed by store.tasks.push().
  // That second call should be routed to the next store
  getByText('Add a task').click();

  getByText('A new task');

  getByText('Delete all tasks').click();

  getByText('You have no tasks');

  getByText('Add a task').click();

  getByText('A new task');
});

it('should increment string', () => {
  globalStore.page = {
    status: 'Happy',
  };

  const { getByText } = testUtils.renderStrict(<TestComponent />);

  getByText('Pump the jams').click();

  getByText('Status: Happy!!!');
});
