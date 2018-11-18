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

To use Recollect, you need to know about two things: the `store` object and the `collect` function.

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

You can import, read from, and write to the store in any file. Or, as you saw above, access it as a prop in a component wrapped in `collect`. It's all the same store.

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

But there's just one more thing you might like to know...

### The `afterChange` function

Pass a function to `afterChange` to have it called whenever the store updates. For example, if you wanted to sync your store to local storage, you could do the following (anywhere in your app).

```js
import { afterChange } from 'react-recollect';

afterChange(store => {
  localStorage.setItem('site-data', JSON.stringify(store));
});
```

For a deeper dive into `afterChange`, check out the time travel example in [/docs/reacting-to-changes.md](./docs/reacting-to-changes.md)

## Peeking into Recollect's innards
Some neat things are exposed on `window.__RR__` for tinkering in the console.

- Use `__RR__.debugOn()` to turn on debugging. The setting is stored in local storage, so will persist while you sleep. You can combine this with Chrome's console filtering, for example to only see 'UPDATE' or 'SET' events. Who needs professional, well made dev tools extensions!
- Type `__RR__.debugOff()` and see what happens
- `__RR__.getStore()` returns a 'live' reference to the store. For example, typing `__RR__.getStore().tasks[1].done = true` in the console would update the store, and Recollect would instruct React to re-render the appropriate components.

# Project organization

Please see [/docs/project-organization.md](./docs/project-organization.md) if you're interested in hearing some suggested patterns for working with Recollect in large projects.

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

# Dependencies

Recollect has a peer dependency of React, and needs at least version 15.3 (when `PureComponent` was released).

Recollect has no dependencies. :boom:

# Alternatives

If you want a library that guides you in structuring your app, use Redux.

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

# TODO

- [ ] Find a solution for the confusion/bugs around where/when to use the imported store vs the props store.
- [ ] Check for differences between React 15's stack reconciler and 16's fibre reconciler.
- [ ] Investigate reading of props in constructor/lifecycle methods. Do these get recorded correctly? (Particularly componentDidMount.)
- [ ] Handle the more obscure traps
- [ ] Work on minimising renders
- [ ] More tests
- [ ] .gitignore dist (but still publish source to npm)
- [ ] A readme section for patterns. Or a blog post. 'selectors', 'updaters', general best practices and elaboration of gotchas.
- [ ] Minify/strip comments on build
