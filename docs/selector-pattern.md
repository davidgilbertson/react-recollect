# The selector pattern

A selector is a function that takes the store as an argument and returns some data.

A simple case for a selector would be to return all incomplete tasks, sorted by due date.

```js
export const getIncompleteTasksSortedByDueDate = store => {
  const tasks = store.tasks.slice();

  return tasks.sort((a, b) => a.dueDate - b.dueDate)
    .filter(task => !task.done);
};
```

You would then use this function by importing it:

```js
import { getIncompleteTasksSortedByDueDate } from '../store/selectors/taskSelectors';
```

And referencing it in your component:

```jsx
const TaskList = ({ store }) => {
  const tasks = getIncompleteTasksSortedByDueDate(store);

  return (
    <div>
      {tasks.map(task => (
        <Task key={task.id} task={task}/>
      ))}
    </div>
  );
};
```

Apologies for the long variable name if you're reading this on mobile.

Maybe we want to conditionally show either all tasks or only incomplete tasks. Let's create a second selector. And while we're at it, move repeated sorting code out into its own function:

```js
const getTasksSortedByDate = tasks => {
  const sortedTasks = tasks.slice();

  return sortedTasks.sort((a, b) => a.dueDate - b.dueDate);
};

export const getAllTasksSortedByDueDate = store => (
  getTasksSortedByDate(store.tasks)
);

export const getIncompleteTasksSortedByDueDate = store => (
  getTasksSortedByDate(store.tasks)
  .filter(task => !task.done)
);
```

And here's a more complex component with local state and a dropdown to show either all tasks or just those that aren't done:

```jsx
class TaskList extends PureComponent {
  state = {
    filter: 'all',
  };

  render () {
    const { store } = this.props;

    const tasks = this.state.filter === 'all'
      ? getAllTasksSortedByDueDate(store)
      : getIncompleteTasksSortedByDueDate(store);

    return (
      <div>
        {tasks.map(task => (
          <Task key={task.id} task={task}/>
        ))}

        <select
          value={this.state.filter}
          onChange={e => {
            this.setState({ filter: e.target.value })
          }}
        >
          <option value="all">All tasks</option>
          <option value="incomplete">Incomplete tasks</option>
        </select>
      </div>
    );
  }
}
```

Now, when a user changes the dropdown, the component state will update, a re-render will be triggered, and as a result, a different selector will be used.

So far none of this has anything to do with Recollect. But there's some interesting stuff happening here that's worth discussing.

## Keeping references to objects in the store
Do you remember when we did this?

```js
const getTasksSortedByDate = tasks => {
  const sortedTasks = tasks.slice();

  return sortedTasks.sort((a, b) => a.dueDate - b.dueDate);
};
```


That `tasks.slice()` part is very important, but first, a history lesson.

When the people that made JavaScript were coming up with array methods, for each one they would do a shot of tequila and flip a coin to decide whether or not it should mutate the original array. So `splice` mutates an array, `slice` does not, `push` does, `concat` does not.

And our friend `sort` _does_ mutate the original array.

But we don't want to change the order of tasks in the store — some other part of the app might be using them. So we `slice()` the array to create a shallow copy. 'Shallow' means that the tasks in the resulting array are still a reference to the actual tasks in the store. So if we call `task.done = true` on one of them, the store will update.

Or more accurately, when you do `task.done = true` Recollect will orchestrate immutably updating the store and re-render any React components that had read that task's `done` property during their last render.

So, it's important that if you return an object from a selector (e.g. a task), and you want to set a property on that object later (e.g. mark it as done), then you need to make sure you're returning a reference to an item in the store, not a copy.

As long as you don't use `Object.assign()` or spread operators or some deep clone tool, you'll be fine.

## Always pass the store to selectors

For the same reason as above, you _must_ pass the store to selectors, and it _must_ be the store that was passed to the component as a prop (not the one you can import directly from `react-recollect`).

The reason is complex but the rule is simple: if you're reading it during the render cycle, it must be the store passed in as a prop.

And that's all there is to selectors. You can put them in a different file, or one file each, leave them at the top of the component file or inline them in the render method of your component. It will all come down to lines of code, how much you like separating your concerns and how much you like git conflicts.