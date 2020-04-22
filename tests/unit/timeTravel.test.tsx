import React from 'react';
import { initStore, store as globalStore, WithStoreProp } from '../..';
import * as testUtils from '../testUtils';
import App from '../integration/TaskListTest/App';

beforeEach(() => {
  // History starts with one item in the store on page load. But we clear the
  // history between tests. So to mimic real behaviour, we initStore()
  // which puts one record in the store
  initStore();
});

it('should go back/forward', () => {
  expect(window.__RR__.getHistory()).toHaveLength(1);

  const { getByText } = testUtils.renderStrict(<App />);

  getByText('Loading...');

  initStore({
    tasks: [
      {
        id: 1,
        name: 'Task 1',
        done: false,
      },
    ],
  });

  expect(window.__RR__.getHistory()).toHaveLength(2);

  getByText('You have 1 task');
  getByText('Add a task').click();
  getByText('You have 2 tasks');

  expect(window.__RR__.getHistory()).toHaveLength(3);

  let consoleMessage = testUtils.withMockedConsoleInfo(window.__RR__.back);
  expect(consoleMessage).toBe('Showing index 1 of 2');
  getByText('You have 1 task');

  consoleMessage = testUtils.withMockedConsoleInfo(window.__RR__.back);
  expect(consoleMessage).toBe('Showing index 0 of 2');
  getByText('Loading...');

  consoleMessage = testUtils.withMockedConsoleInfo(window.__RR__.back);
  expect(consoleMessage).toBe('You are already at the beginning');

  consoleMessage = testUtils.withMockedConsoleInfo(window.__RR__.forward);
  expect(consoleMessage).toBe('Showing index 1 of 2');
  getByText('You have 1 task');

  consoleMessage = testUtils.withMockedConsoleInfo(window.__RR__.forward);
  expect(consoleMessage).toBe('Showing index 2 of 2');
  getByText('You have 2 tasks');

  consoleMessage = testUtils.withMockedConsoleInfo(window.__RR__.forward);
  expect(consoleMessage).toBe('You are already at the end');
  getByText('You have 2 tasks');
});

it('should go to a set index', () => {
  initStore({
    tasks: [
      {
        id: 1,
        name: 'Task 1',
        done: false,
      },
    ],
  });

  const { getByText } = testUtils.renderStrict(<App />);

  getByText('Add a task').click();
  getByText('Add a task').click();
  getByText('Add a task').click();
  getByText('You have 4 tasks');

  let consoleMessage = testUtils.withMockedConsoleInfo(() =>
    window.__RR__.goTo(0)
  );
  expect(consoleMessage).toBe('Showing index 0 of 4');
  getByText('Loading...');

  consoleMessage = testUtils.withMockedConsoleInfo(() => window.__RR__.goTo(2));
  expect(consoleMessage).toBe('Showing index 2 of 4');
  getByText('You have 2 tasks');

  consoleMessage = testUtils.withMockedConsoleWarn(() =>
    window.__RR__.goTo(777)
  );
  expect(consoleMessage).toBe(
    '777 is not valid. Pick a number between 0 and 4.'
  );
  getByText('You have 2 tasks');
});

it('should limit the number of history items', () => {
  jest.useFakeTimers();
  window.__RR__.setHistoryLimit(4);
  const { getByText } = testUtils.renderStrict(<App />);

  initStore({
    tasks: [
      {
        id: 1,
        name: 'Task 1 XXX',
        done: false,
      },
    ],
  });

  getByText('Add a task').click();
  getByText('Add a task').click();
  getByText('Add a task').click();
  getByText('Add a task').click();
  getByText('You have 5 tasks');

  jest.runAllTimers();
  expect(window.__RR__.getHistory()).toHaveLength(4);

  getByText('Add a task').click();
  getByText('Add a task').click();
  getByText('You have 7 tasks');
  jest.runAllTimers();
  expect(window.__RR__.getHistory()).toHaveLength(4);

  window.__RR__.setHistoryLimit(2);
  expect(window.__RR__.getHistory()).toHaveLength(2);

  window.__RR__.setHistoryLimit(1);
  expect(window.__RR__.getHistory()).toHaveLength(1);

  let consoleMessage = testUtils.withMockedConsoleInfo(() =>
    window.__RR__.setHistoryLimit(0)
  );
  expect(consoleMessage).toBe('Time travel is now turned off');

  getByText('Add a task').click();
  getByText('Add a task').click();
  getByText('You have 9 tasks');
  jest.runAllTimers();
  expect(window.__RR__.getHistory()).toHaveLength(0);

  window.__RR__.setHistoryLimit(3);
  getByText('Add a task').click();
  getByText('Add a task').click();
  getByText('You have 11 tasks');
  jest.runAllTimers();
  expect(window.__RR__.getHistory()).toHaveLength(2);

  consoleMessage = testUtils.withMockedConsoleInfo(window.__RR__.back);
  expect(consoleMessage).toBe('Showing index 0 of 1');
  getByText('You have 10 tasks');

  consoleMessage = testUtils.withMockedConsoleInfo(window.__RR__.back);
  expect(consoleMessage).toBe('You are already at the beginning');
  getByText('You have 10 tasks');

  window.__RR__.setHistoryLimit(100);
});

it('should restart history when the store changes', () => {
  jest.useFakeTimers();
  const { getByText } = testUtils.renderStrict(<App />);

  initStore({
    tasks: [
      {
        id: 1,
        name: 'Task 1',
        done: false,
      },
    ],
  });

  getByText('Add a task').click();
  getByText('Add a task').click();
  getByText('Add a task').click();
  getByText('Add a task').click();
  getByText('You have 5 tasks');

  expect(window.__RR__.getHistory()).toHaveLength(6);
  testUtils.withMockedConsoleInfo(window.__RR__.back);
  testUtils.withMockedConsoleInfo(window.__RR__.back);
  testUtils.withMockedConsoleInfo(window.__RR__.back);
  testUtils.withMockedConsoleInfo(window.__RR__.back);
  getByText('You have 1 task');
  // Still the same items in history
  expect(window.__RR__.getHistory()).toHaveLength(6);

  // But now we make a change to the store;
  // all points in history after this point should be deleted
  getByText('Add a task').click();
  getByText('You have 2 tasks');
  expect(window.__RR__.getHistory()).toHaveLength(3);

  getByText('Add a task').click();
  getByText('You have 3 tasks');
  expect(window.__RR__.getHistory()).toHaveLength(4);
});

it('should handle Map and Set', () => {
  globalStore.mySet = new Set(['Set item one', 'Set item two']);
  globalStore.myMap = new Map([
    ['one', 'Map item one'],
    ['two', 'Map item two'],
  ]);

  const { getByText } = testUtils.collectAndRenderStrict(
    ({ store }: WithStoreProp) => {
      if (!store.mySet?.size || !store.myMap?.size) return <div>No data</div>;

      const setItems = Array.from(store.mySet).join(', ');
      const mapItems = Array.from(store.myMap.values()).join(', ');

      return (
        <div>
          <div>{`Set items: ${setItems}`}</div>
          <div>{`Map items: ${mapItems}`}</div>
        </div>
      );
    }
  );

  getByText('Set items: Set item one, Set item two');
  getByText('Map items: Map item one, Map item two');

  // Add some things
  globalStore.mySet.add('Set item three');
  globalStore.myMap.set('three', 'Map item three');

  // Delete some things
  globalStore.mySet.delete('Set item one');
  globalStore.myMap.delete('one');

  getByText('Set items: Set item two, Set item three');
  getByText('Map items: Map item two, Map item three');

  // Now undo the deletions
  testUtils.withMockedConsoleInfo(window.__RR__.back);
  const consoleMessage = testUtils.withMockedConsoleInfo(window.__RR__.back);
  expect(consoleMessage).toBe('Showing index 4 of 6');

  // Check that one, two, and three are all there
  getByText('Set items: Set item one, Set item two, Set item three');
  getByText('Map items: Map item one, Map item two, Map item three');

  // Go back another two steps, before the changes
  testUtils.withMockedConsoleInfo(() => {
    window.__RR__.goTo(2);
  });

  // Check things are back to how they first rendered
  getByText('Set items: Set item one, Set item two');
  getByText('Map items: Map item one, Map item two');

  // Back before the component rendered
  testUtils.withMockedConsoleInfo(window.__RR__.back);
  testUtils.withMockedConsoleInfo(window.__RR__.back);
  getByText('No data');
});
