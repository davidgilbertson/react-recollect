/**
 * This test suite hooks into the componentDidUpdate method of components to
 * assert that the components only update when they need to
 */

import React from 'react';
import { render } from 'react-testing-library';
import App from './App';
import { store } from '../../../dist';

store.site = {
  title: 'The task list site',
};

store.tasks = [{
  id: 1,
  name: 'The first task in the isolation test',
  done: false,
}];

store.notifications = [
  'You have no unread messages at all',
];

const props = {
  onAppUpdate: jest.fn(),
  onTaskListUpdate: jest.fn(),
  onNotificationsUpdate: jest.fn(),
};

const { getByText } = render(<App {...props} />);

it('should render the title', () => {
  getByText('The task list site');
});

it('should render a task', () => {
  getByText('The first task in the isolation test');
});

it('should render a notification', () => {
  getByText('You have no unread messages at all');
});

it('should re-render the App component but not the children', () => {
  store.site.title = 'New and improved!';

  expect(props.onAppUpdate).toHaveBeenCalledTimes(1);
  expect(props.onTaskListUpdate).toHaveBeenCalledTimes(0);
  expect(props.onNotificationsUpdate).toHaveBeenCalledTimes(0);
});

it('should re-render the TaskList component only', () => {
  store.tasks[0].done = true;

  expect(props.onAppUpdate).toHaveBeenCalledTimes(0);
  expect(props.onTaskListUpdate).toHaveBeenCalledTimes(1);
  expect(props.onNotificationsUpdate).toHaveBeenCalledTimes(0);
});

it('should re-render the Notifications component only', () => {
  store.notifications[0] = 'You have a message now!';

  expect(props.onAppUpdate).toHaveBeenCalledTimes(0);
  expect(props.onTaskListUpdate).toHaveBeenCalledTimes(0);
  expect(props.onNotificationsUpdate).toHaveBeenCalledTimes(1);
});
