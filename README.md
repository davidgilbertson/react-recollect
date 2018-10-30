# React Recollect

A library for managing state in a React app.

First things first: **don't use this**.

Browser support is less that 90% (it uses the `Proxy` object, which can't be polyfilled or transpiled).
I've only tested it in about 2% of all possible scenarios, and I'll
probably lose interest 3 days after I publish it to npm.

However I am relying on it in this app: https://github.com/davidgilbertson/scatter-bar so it's not complete garbage.

# Usage, for those that won't heed my warnings

## Installation

```
npm i react-recollect
```

## API

`react-recollect` exports one object and two functions.

### The `store` object

This is where all your data goes, obviously.

You can treat `store` just like you'd treat any JavaScript object, except you can't overwrite it.

```js
import { store } from 'react-recollect';

store.tasks = ['one', 'two', 'three']; // Fine

store.tasks.push('four'); // Good

if ('tasks' in store) // Nice one

delete store.tasks; // No problem

store = 'tasks'; // NOPE!
```

### The `collect` function

This is a Higher Order Component. You wrap a React component in `collect` to have 
Recollect look after that component. You should do this for _every_ component that uses data from
the store when rendering.

```jsx
import React from 'react';
import { collect, store } from 'react-recollect';
import Task from './Task';

const TaskList = () => (
  <div>
    {store.tasks.map(task => (
      <Task key={task.id} task={task} />
    ))}
    
    <button onClick={() => {
      store.tasks.push({
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

Note: if the component doesn't directly access the `store` object, but still uses some data from
the store to render (e.g. you passed in a `task` object that comes from the store), then you
must still wrap that component in `collect`.

Recollect will:
- Watch as this component renders and record what data it accessed
- When any of that data changes, it will trigger an update of the component

Each time the component renders, Recollect re-records what data was used, so conditional rendering
works just fine.

This works with functional stateless components or class-based components. Lifecycle
methods, `setState()` etc continue to work just fine.

### The `afterChange` function

Pass a function to `afterChange` to have it called whenever the store updates. For example, if you wanted
to sync your store to local storage, you could do the following anywhere in your app.

```js
import { afterChange } from 'react-recollect';

afterChange(store => {
  localStorage.setItem('site-data', JSON.stringify(store));
});
```

Use this wisely as it will be called on _every_ change. If you're saving hundreds of kilobytes, 
hundreds of times per second, you might want to debounce.

## Peeking into Recollect's innards
Some neat things are exposed on `window.__RR__` for tinkering in the console.

- Use `__RR__.debugOn()` to turn on debugging. The setting is stored in local storage, so
will persist while you sleep. You can combine this with Chrome's console filtering, for example to only 
see 'UPDATE' or 'SET' events. Who needs professional, well made dev tools extensions!
- Type `__RR__.debugOff()` and see what happens
- `__RR__.getStore()` returns a 'live' reference to the store. For example, 
typing `__RR__.getStore().tasks.pop()` in the console would actually delete a task from the
store and Recollect would instruct React to re-render the appropriate components,
 `__RR__.getStore().tasks[1].done = true` would tick a tickbox, and so on.
- `__RR__.getListeners()` returns Recollect's list of component instances and the data they required the
last time they rendered.

# Dependencies
Recollect needs at least React 15.3 (for `PureComponent`), there are no dependencies. 

# TODO

- [x] Make `react` a peer dependency.
- [ ] Break the source out into multiple files
- [x] Test what happens when you pass state down into a `collect`ed component. Instead of returning false
for `shouldComponentUpdate`, I could do a shallow check, or just use a `PureComponent`, right? Set up a performance test.
- [x] Return `store` in `afterChange`? Pointless, but perhaps what a developer would expect.
