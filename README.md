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

# Questions

## Can I use this with class-based components and functional components?

Yep and yep.

## Will component state still work?

Yep. Recollect has no effect on `setState` or the render cycle that it triggers.

## Do lifecycle methods still fire?

Yep. Recollect has no effect on `componentDidMount` and friends.

## Can I use this with `PureComponent` and `React.memo`?

That's the wrong question :)

When using React _without_ Recollect, React must assess each component to decide which ones it will re-render.
`PureComponent` and `React.memo` are hints to React that say 'you won't need to update this component
if its props and state are the same as last time'.

But Recollect does away with this roundabout method of 'working out' what to re-render. Instead it tells
React _exactly_ which components it needs to re-render. As a result, these 'hints' are of no use.

## Can I use this with `Context`?

Sorry, another wrong question.

Context is a way to share data across your components. But it is of no use when you have a global
`store` object that you can write to and read from anywhere and any time.

## Can I have multiple stores?

You don't want multiple stores :)

There is no performance improvement to be had, so the desire for multiple stores is just an
organizational preference. But objects already have a mechanism to organize their contents, they're called 'properties'. 

So if you want to logically separate your data into different areas, you don't want 
separate _stores_ you want separate props in your store.

```js
import { store as storeContainer } from 'react-recollect';

storeContainer.store1 = {
  what: 'ever',
};

storeContainer.store2 = {
  what: 'ever',
};
```

If you really want to make it _seem_ like these things have no relationship with one another, then
you can create a module that exports different properties of the store. I would suggest that
this is over-thinking it and over-complicating your code.

# Dependencies
Recollect needs at least React 15.3 (for `PureComponent`).

Recollect has no dependencies. (Woot woot.)

# TODO

- [ ] Check for differences between React 15's stack reconciler and 16's fibre reconciler.
- [ ] Investigate polyfilling/adaptation for IE11 and friends. I'm guessing it's slow.
- [ ] Investigate reading of props in constructor/lifecycle methods. Do these get recorded correctly?
(particularly componentDidMount)
- [ ] Do away with that one line of JSX and then Babel? Check support for trailing commas, etc
- [ ] Tests
