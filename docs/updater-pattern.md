# The updater pattern

An updater function is a function that updates the store in some way.

This is a pattern that you may ignore, if you like. But a little bit of organisation goes a long way.

Updaters _always_ have a side effect of updating the store. And you might like to create a rule for yourself: "updaters are the _only_ things that are allowed to have side effects" which is pretty sensible.

But, before we get on to what an updater looks like, let's first establish when they're a bad idea.

## When not to use an updater

Take a look at this task component: 

```jsx
const Task = ({ task }) => (
  <label>
    {task.name}
    <input
      type="checkbox"
      checked={task.done}
      onChange={e => task.done = e.target.checked}
    />
  </label>
);
```

The `task` object being passed in as a prop is a reference to a task in the store. So setting `task.done` will update the store. If you moved this logic into a function called, for example, `toggleTaskDone`, then it would no longer be operating _in the context of a task_.

So when dealing with items in arrays, if you update the store from inside a component, you know exactly which item to update, but if you move the logic out into a function, you lose the context and would need logic to _find_ the task you want to update, and you'll find yourself passing IDs and mapping over arrays.

```js
export const toggleTaskDone = id => {
  store.tasks = store.tasks.map(task => {
    if (task.id === id) return {
      ...task,
      done: !task.done,
    };

    return task;
  });
};
```

It is my opinion that this is unnecessary complexity and harmful to a maintainable codebase, but it's up to you to decide what the rules for you codebase are going to be.

## When and how to use an updater
A recommended file structure groups all operations involving the store in a store directory. Within this, create an `updaters` and a `selectors` directory (we'll talk about selectors later). Then group your updaters in whatever way makes the most sense to you.

```
/app
 ├─/src
   ├─/components
   ├─/store
     ├─/selectors
     ├─/updaters
     │ ├─taskUpdaters.js
```

As a guide:
- If you have lots of large, complex updaters, have one-per-file. This will mean less scrolling and less chance of git conflicts if you're working on a large team.
- If you many, small, simple updaters, then it's fine to keep many per file.

In this example, I will group all updaters related to tasks in the one file.

A nice simple case for an updater would be to mark all tasks as done. Even though it's not many lines of code, there's no _benefit_ to doing it in the context of a component.

So, here's an updater to mark all tasks as done:
```js
export const markAllTasksAsDone = () => {
  store.tasks.forEach(task => {
    task.done = true;
  });
};
```

Remember, even though it looks like you're mutating the store, you aren't. For each call to `task.done = true` 
1. The change is intercepted and blocked
2. A new version of the store is created where all tasks are done
3. The new store is passed to your components to update (only the ones that read from the `done` prop of a task)
4. React will compare the previous state to the new state, and so tasks that were already marked as done will not be re-rendered
5. The previous version of the store will be overwritten with the new version

You would reference the above updater from a component by simply importing it:
```js
import { markAllTasksAsDone } from '../store/updaters/taskUpdaters';
```

Then calling it in response to some user action:
```jsx
<button onClick={markAllTasksAsDone}>
  Mark all as done
</button>
```

As an aside, note that you're updating the store once for each task. Each update will trigger a re-render. If this is taking longer than you would like, you can batch your updates like so:
```js
export const markAllTasksAsDone = () => {
  store.tasks = store.tasks.map(task => ({
    ...task,
    done: true,
  }));
};
```

And only one update to the store will take place.

As always, the cost of this tiny increase in complexity is a tiny increase in the risk of bugs. So weigh that up against the tiny increase in performance and make a wise decision.

## Asynchronous updaters
With Recollect, you don't need to worry about the difference between synchronous or asynchronous, it makes no difference whatsoever.

Let's look at this scenario:
- loading some tasks from the network
- parsing that data in some way
- saving it to the store

```js
export const loadTasksFromServer = async () => {
  const response = await fetch('/api/get-my-tasks');
  const rawTasks = await response.json();
  store.tasks = parseRawTaskData(rawTasks);
};
```

And you might call this function like so:

```jsx
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

It will become usual to expect that updaters have a side effect, just as Redux users will be used to actionCreators having a side effect of updating the store. If you care to be more explicit with your wording, you might try:

```jsx
import * as taskUpdaters from '../store/updaters/taskUpdaters';

class TaskList extends React.Component {
  componentDidMount() {
    taskUpdaters.loadTasksFromServer();
  }

  render () {
    // just render stuff
  }
}
```

