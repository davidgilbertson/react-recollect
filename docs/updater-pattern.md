# The updater pattern

An updater function is a function that updates the store in some way. If you're coming from Redux, think of it as an action creator.

Recollect lets you do whatever you want, so you're free to ignore this pattern. But a little bit of structure can go a long way.

## Organization
A recommended file structure groups all operations involving the store in a store directory. Within this, create an `updaters` and a `selectors` directory (we'll talk about selectors later).

```
/app
 ├─/src
   ├─/components
   ├─/store
     ├─/selectors
     ├─/updaters
     │ ├─taskUpdaters.js
```

Group your updater functions into files in whatever way makes the most sense to you.

As a guide:
- If you have large, complex updaters, have one-per-file. This will mean less scrolling and less chance of git conflicts if you're working on a large team.
- If you have some small, simple updaters that are closely related, then it's fine to keep many per file.

A simple case for an updater would be to mark all tasks as done in a todo app.

```js
export const markAllTasksAsDone = () => {
  store.tasks.forEach(task => {
    task.done = true;
  });
};
```

A quick recap on immutability in Recollect: even though it looks like you're mutating the store here, you aren't. For each `task.done = true`:

1. The change to the `done` prop is intercepted and no change is made
2. A new version of the store is created where the task is done
3. Recollect triggers an update of any component that read the `done` prop of that particular task; passing React the new store
4. For each component, React will compare the previous props to the new props, so if a task was already marked as done it will not be re-rendered
5. The previous version of the store (which wasn't mutated) will be overwritten with the new version

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

Note that you don't have to 'dispatch' and 'action' from an 'action creator', you're just calling a function that updates the store.

As an aside, note that you're updating the store once for each task. Each update will trigger a re-render. If this is taking longer than you would like, you can batch your updates like so:
```js
export const markAllTasksAsDone = () => {
  store.tasks = store.tasks.map(task => ({
    ...task,
    done: true,
  }));
};
```

As always, the cost of this tiny increase in complexity is a tiny increase in the risk of bugs. So weigh that up against the tiny increase in performance and make a measured decision.

## Asynchronous updaters
With Recollect, you don't need to worry about the difference between synchronous or asynchronous, it makes no difference whatsoever.

Let's look at this scenario:
- when a component mounts, load some tasks from the network
- set a 'loading' indicator to true
- parse that data in some way
- save the parsed data to the store
- set a loading indicator to false

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
