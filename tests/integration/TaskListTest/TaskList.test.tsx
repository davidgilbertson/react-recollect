import React from 'react';
import TaskList from './TaskList';
import { store } from '../../..';
import * as testUtils from '../../testUtils';

it('TaskList', async () => {
  const {
    findByText,
    getByText,
    queryByText,
    getByLabelText,
  } = testUtils.renderStrict(<TaskList />);

  // it should render a loading indicator
  getByText('Loading...');

  // it should render the tasks once loaded
  await findByText('Task one');

  // it should mark a task as done in a child component
  const taskOneCheckbox = getByLabelText('Task one') as HTMLInputElement;

  expect(taskOneCheckbox.checked).toBe(false);

  getByLabelText('Task one').click();

  expect(taskOneCheckbox.checked).toBe(true);

  // the component should still be listening to other tasks. See bug:
  // https://github.com/davidgilbertson/react-recollect/issues/100
  const taskTwoCheckbox = getByLabelText('Task two') as HTMLInputElement;

  expect(taskTwoCheckbox.checked).toBe(false);

  getByLabelText('Task two').click();

  expect(taskTwoCheckbox.checked).toBe(true);

  // it should delete a task from a child component
  getByText('Delete Task one').click();

  expect(queryByText('Task one')).toBe(null);
  getByText('Task two');
  getByText('Task three');

  // it should add a task
  getByText('Add a task').click();

  getByText('A new task');

  // it should delete all tasks
  getByText('Delete all tasks').click();

  getByText('You have nothing to do');

  // it should accept a task added from an external source
  if (store.tasks) {
    store.tasks.push({
      id: Math.random(),
      name: 'A task added outside the component',
      done: true,
    });
  }

  const newTaskCheckbox = getByLabelText(
    'A task added outside the component'
  ) as HTMLInputElement;

  expect(newTaskCheckbox.checked).toBe(true);

  newTaskCheckbox.click();

  expect(newTaskCheckbox.checked).toBe(false);

  // it should delete the task object
  // OK this isn't really an integration test,
  // just checking that prop destruction works while I'm here
  getByText('Delete task object').click();

  getByText('Loading...');
});
