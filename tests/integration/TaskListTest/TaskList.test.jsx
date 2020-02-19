import React from 'react';
import { render } from '@testing-library/react';
import TaskList from './TaskList';
import { store } from '../../../src';

it('TaskList', async () => {
  const { findByText, getByText, queryByText, getByLabelText } = render(
    <TaskList />
  );

  // it should render a loading indicator
  getByText('Loading...');

  // it should render the tasks once loaded
  await findByText('Task one');

  // it should mark a task as done in a child component
  const checkbox = getByLabelText('Task one');

  expect(checkbox.checked).toBe(false);

  getByLabelText('Task one').click();

  expect(checkbox.checked).toBe(true);

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
  store.tasks.push({
    id: Math.random(),
    name: 'A task added outside the component',
    done: true,
  });

  const newTaskCheckbox = getByLabelText('A task added outside the component');

  expect(newTaskCheckbox.checked).toBe(true);

  newTaskCheckbox.click();

  expect(newTaskCheckbox.checked).toBe(false);

  // it should delete the task object
  // OK this isn't really an integration test,
  // just checking that prop destruction works while I'm here
  getByText('Delete task object').click();

  getByText('Loading...');
});
