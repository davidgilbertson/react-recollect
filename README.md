# React Recollect

**Featureless state management for React.**

What does 'featureless' mean? It means that Recollect doesn't do much, and you don't need to know much to use it.

Recollect can replace Redux or MobX or similar state management libraries.

Have a play in this [Code Sandbox](https://codesandbox.io/s/lxy1mz200l).

## Warnings

This tool is in its early days, so please test thoroughly and raise any issues you find.

There is no support for any version of IE, Opera mini, or Android browser 4.4 (because Recollect uses the `Proxy` object). Check out the latest usage stats for proxies at [caniuse.com](https://caniuse.com/#feat=proxy).

# Usage

## Installation

```
npm i react-recollect
```

## API

To use Recollect, you need to know about two simple things: the `store` object and the `collect` function.

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

Wrap a React component in `collect` to have Recollect update the component when the store changes.

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
- Collect information about what data the component needs to render
- When any of that data changes, Recollect will instruct React to re-render the component

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

(Use the above pattern wisely. It will be called on _every_ change. If you're saving hundreds of kilobytes, hundreds of times per second, you might want to debounce.)

## Peeking into Recollect's innards
Some neat things are exposed on `window.__RR__` for tinkering in the console.

- Use `__RR__.debugOn()` to turn on debugging. The setting is stored in local storage, so will persist while you sleep. You can combine this with Chrome's console filtering, for example to only see 'UPDATE' or 'SET' events. Who needs professional, well made dev tools extensions!
- Type `__RR__.debugOff()` and see what happens
- `__RR__.getStore()` returns a 'live' reference to the store. For example, typing `__RR__.getStore().tasks[1].done = true` in the console would update the store, and Recollect would instruct React to re-render the appropriate components.

# How Recollect works

The `store` object that Recollect exposes is designed to _feel_ like a mutable object, but it isn't.
 
If you do something like `store.tasks[0].done = true`, Recollect will **not** modify the store. Instead, it will create a new store where the first task's `done` property is `true`. It will then re-render any React components that need to know about that task, passing this _new_ store.

If a React component looks at `prevProps` inside `componentDidUpdate()` it will see the previous version of the store, just like you're used to with state or context (or Redux).

Immediately after the components have re-rendered, the contents of the global `store` object are replaced with contents of the new store. This is all synchronous so that you can treat the store as though it was mutated.

Imagine that we have an array of tasks, none of them done.

```js
// Mark a task as done
store.tasks[0].done = true;

// You changed a property in the store! Now a whole lotta stuff happens:
// - the attempted change above is blocked so that the store object is not changed (mutated)
// - a new store is created where task one is done
// - React components relying on that task will be re-rendered and passed this new store
// - the global store object will have its contents replaced with the new store

// ... and then this code will continue to execute

console.log(store.tasks[0].done); // true. Like you would expect
```

So the end result is exactly the same behaviour as a mutable object.

Sweet.

Hiding away immutability like this allows for simpler code, but there may be times when you're left scratching your head.

For example:

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

console.log(firstTask.done); // false. Wot?!
console.log(store.tasks[0].done); // true. Hmmm.
```

This is not so weird when you remember that any change to the store will immutably change the innards of the store. So when I set `firstTask.done`, Recollect is going to create a new store where that task is done. It doesn't matter if I do `store.tasks[0].done` or `firstTask.done` - at the point where I do this they're the same object.

But when the new version of the store is created, and then written back into the `store` object, the link between `store.tasks[0]` and `firstTask` is broken. So `firstTask` is still pointing to the original version of the task (where `done` is `false`).

This sucks a bit - no one likes confusing things - but it's necessary for React to be able to compare current and previous versions of state.

Just remember:
 - you are safe if you read from the `store` object, you will get the most recent version of the store always.
 - deep references to items in the store may be broken if you modify the store. I'd be interested to hear about cases where this is proving unpleasant. Please feel free to open an issue with a code snippet, even if you think it's something that can't be fixed.

# Questions

## Can I use this with class-based components and functional components?

Yep and yep.

## Will component state still work?

Yep. Recollect has no effect on state and the updates triggered as a result of calling `this.setState`.

## What sort of stuff can go in the store?

Data.

Objects, arrays, strings, numbers, booleans, `null`, and `undefined` are all fine. If your data would survive `JSON.parse(JSON.stringify(store))` then you'll be fine.

Some specific rules:

- No functions (e.g. getters, setters, other methods)
- No properties defined with `Object.defineProperty()`
- No `RegExp` objects
- No `Set`, `Map`, `Proxy`, `Uint16Array` etc.
- No `Symbol` (why you gotta be so fancy?)
- No linking (e.g. one item in the store that is just a reference to another item in the store)

That last one might suck a bit and I'm super sorry about it. But Recollect needs to know 'where' an object is in the store so that it can look after immutability for you.

## Do lifecycle methods still fire?

Yep. Recollect has no effect on `componentDidMount`, `componentDidUpdate` and friends.

## Can I wrap a `PureComponent` or `React.memo` in `collect`?

There is nothing to be gained in doing this.

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

For inspiration, these brave websites have dropped the hammer and now show a message saying they don't support IE:

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
- [ ] A readme section for patters. Or a blog post. 'selectors', 'updaters', general best practices and elaboration of gotchas.
