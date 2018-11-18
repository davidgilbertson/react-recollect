# The updater pattern

An 'updater' is a function that updates the store in some way.

A simple case for an updater would be to mark all tasks as done in a todo app:

```js
export const markAllTasksAsDone = () => {
  store.tasks.forEach(task => {
    task.done = true;
  });
};
```

(Remember, this _looks_ like it's mutating the store, but it isn't.)

You would reference this from a component by importing it:

```js
import { markAllTasksAsDone } from '../store/updaters/taskUpdaters';
```

Then calling it in response to some user action:
```jsx
<button onClick={markAllTasksAsDone}>
  Mark all as done
</button>
```

Note that you don't have to 'dispatch' an 'action' from an 'action creator' to a 'reducer'. You're just calling a function that updates the store.

And since these are just plain functions, they're 'composable'. Or in other words, if you want an updater that calls three other updaters, go nuts.

## Loading data with an updater

Let's create an updater that loads some tasks from an api when our app mounts. It will need to:

1. set a loading indicator to true
2. fetch some tasks from a server
3. save the data to the store
4. set the loading indicator to false

```js
export const loadTasksFromServer = async () => {
  store.loading = true;

  store.tasks = await fetchJson('/api/get-my-tasks');

  store.loading = false;
};
```

You might call this function like so:

```js
import { loadTasksFromServer } from '../store/updaters/taskUpdaters';

class TaskList extends React.Component {
  componentDidMount() {
    loadTasksFromServer();
  }

  render () {
    // just render stuff
  }
}
```

## Asynchronous updaters

Did you notice that we've already covered the super-complex topic of asynchronicity?

And you didn't even need to install `react-recollect-immutable-thunk-saga-helper` :)

## Testing an updater
Let's write a unit test to call our updater and assert that it put the correct data in the store. The function we're testing is async, so our test will be async too:

```js
test('loadTasksFromServer should update the store', async () => {
  // Execute the updater
  await loadTasksFromServer();

  // Check that the final state of the store is what we expected
  expect(store).toEqual(expect.objectContaining({
    loading: false,
    tasks: [
      {
        id: 1,
        name: 'Fetched task',
        done: false,
      }
    ]
  }));
});
```

Pretty easy, right?

We can make it less easy.

Maybe we want to assert that `loading` was set to `true`, then the tasks loaded, and then `loading` was set to `false` again.

Well, Recollect exports an `afterChange` function designed to call a callback every time the store changes. If we pass it a Jest mock function, Jest will conveniently keep a record of each change to the store for us.

Also, no one likes half an example, so here's the entire test file:

```js
import { afterChange, store } from 'react-recollect';
import { loadTasksFromServer } from './taskUpdaters';

jest.mock('../../utils/fetchJson', () => async () => ([{
  id: 1,
  name: 'Fetched task',
  done: false,
}]));

test('loadTasksFromServer should update the store', async () => {
  // Create a mock
  const afterChangeHandler = jest.fn();

  // Pass the mock to afterChange. Jest will record calls to this function
  // and therefore record calls to update the store.
  afterChange(afterChangeHandler);

  // Execute our updater
  await loadTasksFromServer();

  // afterChangeHandler will be called with the new version of the store as the first parameter
  // and the 'path' of the updated property as the second.
  expect(afterChangeHandler.mock.calls[0][1]).toBe('store.loading');
  expect(afterChangeHandler.mock.calls[0][0].loading).toBe(true);

  expect(afterChangeHandler.mock.calls[1][1]).toBe('store.tasks');
  expect(afterChangeHandler.mock.calls[1][0].tasks.length).toBe(1);

  expect(afterChangeHandler.mock.calls[2][1]).toBe('store.loading');
  expect(afterChangeHandler.mock.calls[2][0].loading).toBe(false);

  // Check that the final state of the store is what we expected
  expect(store).toEqual(expect.objectContaining({
    loading: false,
    tasks: [
      {
        id: 1,
        name: 'Fetched task',
        done: false,
      }
    ]
  }));
});
```
