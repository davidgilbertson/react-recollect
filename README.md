# React Recollect

**Featureless state management for React.**

What does 'featureless' mean? It means that Recollect has a tiny API with (almost) nothing to learn.

Recollect can replace Redux or MobX or similar state management libraries.

Have a play in this [Code Sandbox](https://codesandbox.io/s/lxy1mz200l).

## Warnings

There is no support for any version of IE, Opera mini, or Android browser 4.4 (because Recollect uses the `Proxy` object). Check out the latest usage stats at [caniuse.com](https://caniuse.com/#feat=proxy).

This tool is in its early days, so please test thoroughly and raise any issues you find.

# Usage

## Installation

```
npm i react-recollect
```

## API

To use Recollect, you need to know about two things: the `store` object and the `collect` function.

### The `store` object

This is where your data goes. You can treat `store` just like you'd treat any JavaScript object.

```js
import { store } from 'react-recollect';

store.tasks = ['one', 'two', 'three']; // Fine

store.tasks.push('four'); // Good

if ('tasks' in store) // Nice one

delete store.tasks; // No problem

store = 'tasks'; // NOPE! (Can't reassign a constant)
```

You can write to and read from this store object _anytime_, _anywhere_. Your React components will _always_ reflect the data in this store, provided they're wrapped in...

### The `collect` function

Wrap a React component in `collect` to have Recollect look after that component.

```jsx
import React from 'react';
import { collect } from 'react-recollect';
import Task from './Task';

const TaskList = ({ store ) => (
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

Recollect will:
- Provide the store as a prop
- Collect information about what data the component needs in order to render.
- When any of that data changes, Recollect will instruct React to re-render the component.

As a general rule, if you're **reading from** the store in a component, use the store passed in as a prop. If you're **writing to** the store outside of a component, use the store object exported by `react-recollect`.

---

You've already finished learning `react-recollect`. Well done, you!

In addition to those two things, there's just one more thing you might like to know...

### The `afterChange` function

Pass a function to `afterChange` to have it called whenever the store updates. For example, if you wanted to sync your store to local storage, you could do the following (anywhere in your app).

```js
import { afterChange } from 'react-recollect';

afterChange(store => {
  localStorage.setItem('site-data', JSON.stringify(store));
});
```

Use this wisely as it will be called on _every_ change. If you're saving hundreds of kilobytes, hundreds of times per second, you might want to debounce.

## Peeking into Recollect's innards
Some neat things are exposed on `window.__RR__` for tinkering in the console.

- Use `__RR__.debugOn()` to turn on debugging. The setting is stored in local storage, so will persist while you sleep. You can combine this with Chrome's console filtering, for example to only see 'UPDATE' or 'SET' events. Who needs professional, well made dev tools extensions!
- Type `__RR__.debugOff()` and see what happens
- `__RR__.getStore()` returns a 'live' reference to the store. For example, typing `__RR__.getStore().tasks.pop()` in the console would actually delete a task from the store and Recollect would instruct React to re-render the appropriate components, `__RR__.getStore().tasks[1].done = true` would tick a tickbox, and so on.
- `__RR__.getListeners()` returns Recollect's list of component instances and the data they required the last time they rendered.

# Questions

## Can I use this with class-based components and functional components?

Yep and yep.

## Will component state still work?

Yep. Recollect has no effect on state and the updates triggered as a result of calling `this.setState`.

## What sort of stuff can go in the store?

Data. Objects, array, numbers, booleans, strings, null, undefined.

In short, if your data would survive `JSON.parse(JSON.stringify(store))` then you'll be fine.

- No functions (e.g. getters, setters, other methods)
- No properties defined with `Object.defineProperty()`
- No RegExp objects
- No Sets, Maps etc.
- No Symbols (why you gotta be so fancy?)
- No linking (e.g. one item in the store that is just a reference to another item in the store)

That last one might suck a bit and I'm super sorry about it. But Recollect needs to know 'where' an object is in the store so that it can look after immutability for you.

## Do lifecycle methods still fire?

Yep. Recollect has no effect on `componentDidMount` and friends.

## Can I use this with `PureComponent` and `React.memo`?

That's the wrong question :)

When using React _without_ Recollect, React must assess each component to decide which ones it will re-render. `PureComponent` and `React.memo` are hints to React that say 'you won't need to update this component if its props and state are the same as last time'.

But Recollect does away with this roundabout method of 'working out' what to re-render. Instead it tells React _exactly_ which components it needs to re-render.

As a result, these 'hints' are of no benefit as performance enhancing methods.

(And if you're still not convinced, you should know that the `collect` function actually wraps your component in a `PureComponent` so it would be doubly useless to use a `PureComponent` then wrap it in `collect`.)

## Can I use this with `shouldComponentUpdate()`?

Yes, but no, but you probably don't need to.

The [React docs](https://reactjs.org/docs/react-component.html#shouldcomponentupdate) say of `shouldComponentUpdate()`:

> This method only exists as a performance optimization. Do not rely on it to “prevent” a rendering, as this can lead to bugs ... In the future React may treat shouldComponentUpdate() as a hint rather than a strict directive, and returning false may still result in a re-rendering of the component

So, if you're using `shouldComponentUpdate` for _performance_ reasons, then you don't need it anymore. If the `shouldComponentUpdate` method is executing, it's because Recollect has _told_ React to update the component, which means a value that it needs to render has changed.

## Can I use this with `Context`?

Sorry, another wrong question.

Context is a way to share data across your components. But why would you bother when you have a global `store` object that you can write to and read from anywhere and any time.

## Can I have multiple stores?

You don't want multiple stores :)

There is no performance improvement to be had, so the desire for multiple stores is just an organizational preference. And objects already have a mechanism to organize their contents: 'properties'.

# Dependencies

Recollect has a peer dependency of React, and needs at least version 15.3 (when `PureComponent` was released).

Recollect has no dependencies. :boom:

# Alternatives

If you want a library that guides you in structuring your app, use Redux.

If you want time travel, use Redux.

If you want IE support, use Redux.

If you want explicit 'observables' and multiple stores, use MobX.

If you want nostalgia, use Flux.

Also there is a library that is very similar to this one (I didn't copy, promise) called [`react-easy-state`](https://github.com/solkimicreb/react-easy-state). It's more mature than this library, but _slightly_ more complex and has external dependencies.

# Is it really OK to drop support for IE?
Sure, why not! Imagine: all that time you spend getting stuff to work for a few users in crappy old browsers could instead be spent making awesome new features for the vast majority of your users.

For inspiration, these brave websites have made the move and now show a message saying they don't support IE:

- GitHub (owned by Microsoft!)
- devdocs.io 
- Flickr 
- Codepen

# TODO

- [ ] Check for differences between React 15's stack reconciler and 16's fibre reconciler.
- [ ] Investigate reading of props in constructor/lifecycle methods. Do these get recorded correctly? (Particularly componentDidMount.)
- [ ] Handle the more obscure traps
- [ ] Work on minimising renders
- [ ] More tests
- [ ] .gitignore dist (but still publish source to npm)
