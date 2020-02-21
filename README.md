![Node.js CI](https://github.com/davidgilbertson/react-recollect/workflows/Node.js%20CI/badge.svg)

# React Recollect

Recollect is a state management library that aims to solve two problems with the traditional React/Redux approach:

1. Immutability is complicated and prone to bugs
2. Components can be re-rendered as a result of a store change, even if they don't use the data that changed 

Recollect solves these problems like so:

1. The Recollect store is immutable, but the implementation is hidden. So, you can interact with the store as though it was a plain JavaScript object. No need to worry about accidentally mutating the store. With Recollect that's impossible.
2. Recollect keeps a record of which components use which properties from the store. When a property in your store changes, only the appropriate components are targeted for an update.

Take it for a spin in this [Code Sandbox](https://codesandbox.io/s/lxy1mz200l).

## Warnings

This tool is in its early days, so please test thoroughly and raise any issues you find (although there's a pretty extensive test suite in `/tests`).

There is no support for any version of IE, Opera mini, or Android browser 4.4 (because Recollect uses the `Proxy` object). Check out the latest usage stats for proxies at [caniuse.com](https://caniuse.com/#feat=proxy).

# Contents

Don't be put off by the long list, you only need to know `collect` and `store` to get started.

- [Basic usage](#basic-usage)
  - [Installation](#installation)
  - [API](#api)
    - [The `collect` function](#the-collect-function)
    - [The `store` object](#the-store-object)
- [Advanced usage](#advanced-usage)
  - [The `afterChange` function](#the-afterchange-function)
  - [Passing a ref to a `collect`ed component](#passing-a-ref-to-a-collected-component)
  - [Peeking into Recollect's innards](#peeking-into-recollects-innards)
  - [Server-side rendering](#server-side-rendering)
    - [On the server](#on-the-server)
    - [In the browser](#in-the-browser)
  - [Usage with TypeScript](#usage-with-typescript)
    - [Your store](#your-store)
    - [Using collect](#using-collect)
- [How Recollect works](#how-recollect-works)
- [Project structure guidelines](#project-structure-guidelines)
  - [Concepts](#concepts)
  - [Selectors](#selectors)
    - [Keeping references to objects in the store](#keeping-references-to-objects-in-the-store)
    - [Always pass the store to selectors](#always-pass-the-store-to-selectors)
  - [Updaters](#updaters)
    - [Loading data with an updater](#loading-data-with-an-updater)
    - [Asynchronous updaters](#asynchronous-updaters)
    - [Testing an updater](#testing-an-updater)
- [Questions](#questions)
  - [What sort of stuff can go in the store?](#what-sort-of-stuff-can-go-in-the-store)
  - [Can I use this with class-based components and functional components?](#can-i-use-this-with-class-based-components-and-functional-components)
  - [Will component state still work?](#will-component-state-still-work)
  - [Do lifecycle methods still fire?](#do-lifecycle-methods-still-fire)
  - [Can I wrap a `PureComponent` or `React.memo` in `collect`?](#can-i-wrap-a-purecomponent-or-reactmemo-in-collect)
  - [Can I use this with `shouldComponentUpdate()`?](#can-i-use-this-with-shouldcomponentupdate)
  - [Can I use this with `Context`?](#can-i-use-this-with-context)
  - [Can I have multiple stores?](#can-i-have-multiple-stores)
  - [Tell me about your tests](#tell-me-about-your-tests)
  - [How big is it?](#how-big-it-it)
- [Dependencies](#dependencies)
- [Alternatives](#alternatives)
- [Is it really OK to drop support for IE?](#is-it-really-ok-to-drop-support-for-ie)


# Basic usage

## Installation

```
npm i react-recollect
```

## API

To get started with Recollect, you need to know about two things: the `store` object and the `collect` function.

### The `collect` function

You can wrap a React component in `collect` to have Recollect take care of it. Here's a component that reads from and writes to the store.

```jsx
import React from 'react';
import { collect } from 'react-recollect';
import Task from './Task';

const TaskList = ({ store }) => (
  <div>
    {store.tasks.map(task => (
      <Task key={task.id} task={task} />
    ))}
    
    <button onClick={() => {
      store.tasks.push({
        id: Math.random(),
        name: 'A new task',
        done: false,
      });
    }}>
      Add a task
    </button>
  </div>
);

export default collect(TaskList);
```

Recollect will:
- Provide a store object as a prop
- Collect information about what data the component needs to render
- When any of that data changes, Recollect will instruct React to re-render the component

Let's talk some more about...

### The `store` object

You can import, read from, and write to the store in any file. Or, as you saw above, access it as a prop in a component wrapped in `collect`.

You don't need to 'create' or 'initialize' this store, it's just there, ready when you are.

And you can treat the `store` object just like you'd treat any JavaScript object.

```js
import { store } from 'react-recollect';

store.tasks = ['one', 'two', 'three']; // Fine

store.tasks.push('four'); // Good

if ('tasks' in store) // Nice one

delete store.tasks; // No problem

store = 'tasks'; // NOPE! (Can't reassign a constant)
```

 Recollect is always watching and it knows which components need what data from the store, so it will trigger updates accordingly.

**An important note:** when referring to the store **within a component**, it's important that you use the `store` object passed in as a prop, not the `store` imported from `react-recollect`. The reason for this is super-interesting and described in great detail below.

---

Congratulations my friend, you just finished learning Recollect. I am very proud of you.

Go have a play, and when you're ready for more readme, come back to read about ...

# Advanced usage

## The `afterChange` function

Pass a function to `afterChange` to have it called whenever the store updates. For example, if you wanted to sync your store to local storage, you could do the following (anywhere in your app).

```js
import { afterChange } from 'react-recollect';

afterChange(({ store }) => {
  localStorage.siteData = JSON.stringify(store);
});
```

Your callback will be called with an object, which has four properties:

* `store` — the store
* `propPath` — the 'path' of the property that changed. E.g. `'tasks.2.done'`
* `components` — an array of the components that were updated
* `prevStore` — the previous version of the store

Those last two might be interesting if you want to implement time travel, for example:

```js
const thePast = [];
const theFuture = [];

window.TIME_TRAVEL = {
  back() {
    if (!thePast.length) return;

    const event = thePast.pop();
    theFuture.push(event);

    event.components.forEach(component => {
      component.update(event.prevStore);
    });

    console.log('Replayed the change made to', event.propPath);
  },
  forward() {
    if (!theFuture.length) return;

    const event = theFuture.pop();
    thePast.push(event);

    event.components.forEach(component => {
      component.update(event.store);
    });

    console.log('Replayed the change made to', event.propPath);
  },
};

afterChange(changeEvent => {
  if (changeEvent.components.length) thePast.push(changeEvent);
});
```

## Passing a ref to a `collect`ed component
The `collect` function takes a second parameter — an options object with one property, `forwardRef`. When you supply this property, you will be able to provide a `ref` to the wrapped component, which will be made available on that component as `props.forwardedRef`.

The component that you're wrapping in `collect` would then look like this:

```jsx
const MyInput = props => (
  <label>
    Some input
    <input ref={props.forwardedRef} />
  </label>
);

export default collect(MyComponent, { forwardRef: true });
```

And passing it a ref would look the same as passing a ref to any other component

```jsx
class MyParentComponent extends Component {
  constructor(props) {
    super(props);

    this.inputRef = React.createRef();
  }

  render () {
    return (
      <div>
        <MyInput ref={this.inputRef}/>

        <button
          onClick={() => {
            this.inputRef.current.focus()
          }}
        >
          Focus the input for some reason
        </button>
      </div>
    );
  }
}
```

You can forward a ref to class-based components or stateless functional components.

## Peeking into Recollect's innards
Some neat things are exposed on `window.__RR__` for tinkering in the console.

- Use `__RR__.debugOn()` to turn on debugging. The setting is stored in local storage, so will persist while you sleep. You can combine this with Chrome's console filtering, for example to only see 'UPDATE' or 'SET' events. Who needs professional, well made dev tools extensions!
- Type `__RR__.debugOff()` and see what happens
- `__RR__.getStore()` returns a 'live' reference to the store. For example, typing `__RR__.getStore().tasks[1].done = true` in the console would update the store, and Recollect would instruct React to re-render the appropriate components.

## Server-side rendering

When you're only using Recollect in the browser, you don't need to 'create' or 'initialize' the store.

When you server-render though, you _do_ need to initialize the store, because unlike a browser, a server is shared between many users.

Enter the `initStore` function, which you use on the server and in the browser.

### On the server

Here's a minimal implementation of server-side rendering with Express and Recollect.

```jsx
// Create an express app instance
const app = express();

// Read the HTML template on start up (this is the create-react-app output)
const htmlTemplate = fs.readFileSync(path.resolve(__dirname, '../../build/index.html'), 'utf8');

// We'll serve our page to requests at '/'
app.get('/', async (req, res) => {
  // Fetch some data
  const tasks = await fetchTasksForUser(req.query.userId);

  // Populate the Recollect store (discarding any previous state)
  initStore({tasks});

  // Render the app. Components will read from the Recollect store as usual
  const appMarkup = ReactDOMServer.renderToString(<App />);

  // Serialize the store (replacing left tags for security)
  const safeStoreString = JSON.stringify(store).replace(/</g, '\\u003c');

  // Insert the markup and the data into the template
  const htmlWithBody = htmlTemplate.replace(
    '<div id="root"></div>',
    `<div id="root">${appMarkup}</div>
    <script>window.__PRELOADED_STATE__ = ${safeStoreString};</script>`
  );

  // Return the rendered page to the user
  res.send(htmlWithBody);
});
``` 

It's important that you populate the store using `initStore`, and do so right before rendering your app with `ReactDOMServer.renderToString()`.

This is because your Node server might receive several requests from several users at the same time. All of these requests share the same global state, including the `store` object.

So, you must make sure that for each request, you populate the store and render the markup at the same time. And by 'at the same time', I mean _synchronously_.

### In the browser

In the entry point to your app, right before you call `ReactDOM.hydrate()`, call `initStore()` with the data that you sent from the server:

To recap: on the server, you initialize the store with some data, render the markup, and embed the store data in the page. Then in the browser, you get that data from the page, initialize the store with it, and render your React components.

```jsx
import { initStore } from 'react-recollect';

// other stuff

initStore(window.__PRELOADED_STATE__);

ReactDOM.hydrate(<App />, document.getElementById('root'));
```

This will take the data that you saved in the DOM on the server and fill up the Recollect store with it. You should only init the store once, before the initial render.

## Usage with TypeScript

### Your store

Define the shape of your recollect `store` like this:
```ts
declare module 'react-recollect' {
  interface Store {
    someProp?: string[];
    somethingElse?: string;
  }
}
```
Put this in a declarations file such as `src/types/RecollectStore.ts`.

### Using collect

Components wrapped in `collect` must define `store` in `props` - 
use the `WithStoreProp` interface for this:
```ts
import { collect, WithStoreProp } from 'react-recollect';

interface Props extends WithStoreProp {
  someComponentProp: string;
}
const TaskList: React.SFC<Props> = ({ store, someComponentProp }) => (
  // < your awesome JSX here>
);
export default collect(TaskList);
```

# How Recollect works

> This section is for the curious, you don't need to know any of this to use Recollect.

The `store` object that Recollect exposes is designed to _feel_ like a mutable object, but it isn't.
 
If you do something like `store.site.title = 'Page two'`, Recollect will **not** mutate the store object (the `Proxy` object that wraps the store will block the `.set()` operation). Instead, it will create a new store where the site title is 'Page two'. It will then re-render any React components that need to know about the title, passing this _new_ store.

During that next render cycle, if a React component looks at `prevProps` inside `componentDidUpdate()` it will see the previous version of the store, just like you're used to with state, context, or Redux.

Immediately after the components have re-rendered, the contents of the global `store` object are replaced with the contents of the new store. This is all synchronous, so in your code you can treat the store as though it was mutated.

Let's summarise in code:

```js
store.site.title = 'Page two';

// - the attempted change is blocked
// - a new store is created 
// - relevant React components are updated with the new store
// - the global store object will have its contents replaced with the new store
// - and then this code will continue to execute...

console.log(store.site.title); // 'Page two'. Like you would expect
```

So the end result is exactly the same behaviour as a mutable object.

Sweet.

Hiding away immutability like this allows for simpler code, but there may be times when you're left scratching your head.

But you can see in this fancy footwork that if you used the _global_ store object inside the render method of a component, you'd actually be getting the previous version of the data, because the 'update components' step comes before the 'update the global store' step. 

Another example:

```js
const firstTask = store.tasks[0];
const secondTask = store.tasks[1];

store.tasks[0].done = true;

console.log(store.tasks[0].done); // true

console.log(firstTask === store.tasks[0]); // false. This task was changed
console.log(secondTask === store.tasks[1]); // true. This task wasn't changed
```

`firstTask` starts life as a reference to `store.tasks[0]`, but when the store is updated, `store.tasks[0]` is _replaced_ with a new version of the task. So it is no longer the same thing as `firstTask`.

Note also that Recollect is not just doing a full clone of the store, it only clones the object that was changed (and its ancestors), just like Redux reducers.

Now for something a bit weird:
```js
const firstTask = store.tasks[0];

firstTask.done = true;

console.log(firstTask.done); // false - wot?!
console.log(store.tasks[0].done); // true - double-wot??!!
```

This is not so weird when you remember that any attempted change to the store will create a new version of the store, then copy it back into the store object. So when I set `firstTask.done`, Recollect is going to create a new store where that task is done. It doesn't matter if I do `store.tasks[0].done` or `firstTask.done` - at the point where I do this they're the same object.

But when the new version of the store is created, and then written back into the `store` object, the link between `store.tasks[0]` and `firstTask` is broken. So `firstTask` is still pointing to the original version of the task (where `done` is `false`).

This sucks a bit - no one likes confusing things - but it's necessary to allow React to compare current and previous versions of state (which allows it to cleverly not update components where props didn't change).

Just remember:
 - you are safe if you read from the `store` object, you will get the most recent version of the store always.
 - deep references to items in the store may be broken if you modify the store. I'd be interested to hear about cases where this is proving unpleasant. Please feel free to open an issue with a code snippet, even if you think it's something that can't be fixed.

# Project structure guidelines

The ideas described in this section aren't part of the Recollect API, they're simply a guide.

## Concepts

Two concepts are discussed in this section (neither of them new):

* **Selectors** contain logic for retrieving and data from the store.

* **Updaters** contain logic for updating the store. Updaters also handle reading/writing data from outside the browser (e.g. loading data over the network or from disk).

![Cycle of life](cycle.png)

In a simple application, you don't need to explicitly think in terms of updaters and selectors. For example:

- defining `checked={task.done}` in a checkbox is a tiny little 'selector'
- executing `task.done = true` when a user clicks that checkbox is a tiny little 'updater'

But as your app grows, it's important to keep your components focused on UI — you don't want 200 lines of logic in the `onClick` event of a button.

So there will come a point where moving code out of your components into dedicated files is necessary, and at this point, updaters and selectors will serve as useful concepts for organization.

In the examples below, I'll use a directory structure like this:

```
/my-app
 └─ src
    ├─ components
    ├─ store
    │  ├─ selectors
    │  └─ updaters
    └─ utils
```

(Fun fact: _selector_ ends in 'or' because 'select' is derived from latin, while _updater_ ends in 'er' because it was made up in 1941 and 'or' had gone out of style.)

## Selectors

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

### Keeping references to objects in the store
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

As long as you don't use `Object.assign()` or spread operators or some deep clone function, you'll be fine.

### Always pass the store to selectors

For the same reason as above, you _must_ pass the store to selectors, and it _must_ be the store that was passed to the component as a prop (not the one you can import directly from `react-recollect`).

The reason is complex but the rule is simple: if you're reading the store when rendering a component, it must be the store passed in as a prop.

## Updaters

An 'updater' is a function that updates the store in some way.

A simple case for an updater would be to mark all tasks as done in a todo app:

```js
export const markAllTasksAsDone = () => {
  store.tasks.forEach(task => {
    task.done = true;
  });
};
```

(Remember, this _looks_ like it's mutating the store, but it ain't.)

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

You don't need to 'dispatch' an 'action' from an 'action creator' to a 'reducer'; you're just calling a function that updates the store.

And since these are just plain functions, they're 'composable'. Or in other words, if you want an updater that calls three other updaters, go nuts.

### Loading data with an updater

Let's create an updater that loads some tasks from an api when our app mounts. It will need to:

1. Set a loading indicator to true
2. Fetch some tasks from a server
3. Save the data to the store
4. Set the loading indicator to false

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

### Asynchronous updaters

Did you notice that we've already covered the super-complex topic of asynchronicity?

And you didn't even need to install `react-recollect-immutable-thunk-saga-helper` :)

### Testing an updater
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

Well, Recollect exports an `afterChange` function designed to call a callback every time the store changes. If we pass it a Jest mock function, Jest will conveniently keep a record of each time the store changed.

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

  // afterChangeHandler will be called with the new version of the store and the path that was changed
  const firstChange = afterChangeHandler.mock.calls[0][0];
  const secondChange = afterChangeHandler.mock.calls[1][0];
  const thirdChange = afterChangeHandler.mock.calls[2][0];
  
  expect(firstChange.propPath).toBe('loading');
  expect(firstChange.store.loading).toBe(true);

  expect(secondChange.propPath).toBe('tasks');
  expect(secondChange.store.tasks.length).toBe(1);

  expect(thirdChange.propPath).toBe('loading');
  expect(thirdChange.store.loading).toBe(false);

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

# Questions

## What sort of stuff can go in the store?

Data.

Objects, arrays, strings, numbers, booleans, `null`, and `undefined` are all fine.

Specifically, it must be JSON data, which means:

- No functions (e.g. getters, setters, or other methods)
- No properties defined with `Object.defineProperty()`
- No `RegExp` objects
- No `Date` objects (I'm working on this)
- No `Set`, `Map`, `Proxy`, `Uint16Array` etc.
- No `Symbol` (why you gotta be so fancy?)
- No linking (e.g. one item in the store that is just a reference to another item in the store)

That last one might suck a bit and I'm super sorry about it. But Recollect needs to know 'where' an object is in the store so that it can look after immutability for you.

(OK technically you can't have `undefined` in JSON, but it's fine in the Recollect store.)

## Can I use this with class-based components and functional components?

Yep and yep.

## Will component state still work?

Yep. Recollect has no effect on state and the updates triggered as a result of calling `this.setState`.

## Do lifecycle methods still fire?

Yep. Recollect has no effect on `componentDidMount`, `componentDidUpdate` and friends.

## Can I wrap a `PureComponent` or `React.memo` in `collect`?

The `collect` function wraps your component in a `PureComponent` and there's no point in having two of them.

## Can I use this with `shouldComponentUpdate()`?

Yes, but no, but you probably don't need to.

The [React docs](https://reactjs.org/docs/react-component.html#shouldcomponentupdate) say of `shouldComponentUpdate()`:

> This method only exists as a performance optimization. Do not rely on it to “prevent” a rendering, as this can lead to bugs ... In the future React may treat shouldComponentUpdate() as a hint rather than a strict directive, and returning false may still result in a re-rendering of the component

So, if you're using `shouldComponentUpdate` for _performance_ reasons, then you don't need it anymore. If the `shouldComponentUpdate` method is executing, it's because Recollect has _told_ React to update the component, which means a value that it needs to render has changed.

## Can I use this with `Context`?

That's a wrong question.

Context is a way to share data across your components. You don't need this now that you have a global `store` object that you can read from and write to anywhere and at any time.

## Can I have multiple stores?

You don't want multiple stores :)

There is no performance improvement to be had, so the desire for multiple stores is just an organizational preference. And objects already have a mechanism to organize their contents: 'properties'.

## Tell me about your tests

In the `/tests` directory you'll find:
- Unit tests that test the behaviour of the store directly
- Integration tests that simulate a user interacting with React components that use `store` and `collect` - these might be interesting to you if you want to see examples of `store`/`collect` being used.

## How big is it?

It's about 4 KB. If you were to replace `redux`, `redux-thunk`, and `react-redux` with this library, you'd shed a bit over 2 KB. But if you've got a decent sized app you'll save much more than that just by getting rid of all your reducers.

# Dependencies

Recollect has a peer dependency of React, and needs at least version 15.3 (when `PureComponent` was released).

# Alternatives

If you want IE support, use Redux.

If you want explicit 'observables' and multiple stores, use MobX.

If you want a walk down memory lane, use Flux.

Also there is a library that is very similar to this one (I didn't copy, promise) called [`react-easy-state`](https://github.com/solkimicreb/react-easy-state). It's more mature than this library, but _slightly_ more complex and has external dependencies.

# Is it really OK to drop support for IE?
Sure, why not! Imagine: all that time you spend getting stuff to work for a few users in crappy old browsers could instead be spent making awesome new features for the vast majority of your users.

For inspiration, these brave websites have dropped the hammer and now show a message saying they don't support IE:

- GitHub (owned by Microsoft!)
- devdocs.io 
- Flickr 
- Codepen
