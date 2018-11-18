# Project organization

The ideas described on this page aren't part of the Recollect API, they're simply a guide — a suggestion for how you might like to organize your code.

## Concepts

This page talks about the concept of 'updaters' and 'selectors' (neither of them new ideas). _Updaters_ contain logic for updating the store, and _selectors_ contain logic for retrieving data from the store.

- defining `checked={task.done}` in a checkbox is a tiny little 'selector'
- executing `task.done = true` when a user clicks that checkbox is a tiny little 'updater'

As you can see, in a simple application you don't need to explicitly think about updaters or selectors.

But it's important to keep your components focused on UI — you don't want 200 lines of logic in the `onClick` event of a button. So there will come a point where moving code out of your components into dedicated files is necessary, and these two concepts will go a long way toward keeping your code base under control.

## Directory structure

Here's an example directory structure:

```
/ my-app
 ├─/ src
   ├─/ components
   ├─/ store
     ├─/ selectors
     ├─/ updaters
```

## Selectors

Reading from a JavaScript object is pretty simple, so many apps won't ever need to bother with selectors. But for more complex operations like 'get all products under $40, sorted by price', selectors will be your friend.

Read more about selectors in selectors-pattern.md (coming soon!)

## Updaters

Updaters have more work to do than selectors, because they will often read from, or write to, an external resource like the network.

Read more about updaters in [updater-pattern.md](./updater-pattern.md)