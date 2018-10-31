# React Recollect

Featureless state management for React.

What does that mean? It means that Recollect doesn't have any 'features' - it has an absolutely miniaml API with (almost) nothing to learn.

If you want an opinionated library that guides you in structuring a larger app, use Redux.

If you want 'observables' and 'features', use MobX.

## Warnings:

There is no support for any version of IE, Opera mini, or Android browser 4.4, because Recollect uses the `Proxy` object. Check out the latest usage stats at [caniuse.com](https://caniuse.com/#feat=proxy)

This tool is in its early days, so please test heavily in all browsers you want to support and raise any issues you find.

However I am relying on it in this app: https://github.com/davidgilbertson/scatter-bar so it's not completely unreliable.

# Usage

## Installation

```
npm i react-recollect
```

## API

All you need to use `react-recollect` is one object and one function.

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

In addition to those two things, there's just one more thing...

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
