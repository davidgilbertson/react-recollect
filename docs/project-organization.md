# Project organization

The ideas described on this page aren't part of the Recollect API, they're simply a guide — a suggestion for how you might like to organize your code.

## Concepts

This page talks about the concept of 'updaters' and 'selectors' (neither of them new ideas). _Updaters_ contain logic for updating the store, and _selectors_ contain logic for retrieving data from the store. Updaters also handle reading data from outside the app (e.g. over the network or from disk) and saving data back to storage.

![Cycle of life](./cycle.png)

These concepts don't need to map to directories or files though. For example:

- defining `checked={task.done}` in a checkbox is a tiny little 'selector'
- executing `task.done = true` when a user clicks that checkbox is a tiny little 'updater'

As you can see, in a simple application you don't need to explicitly think in terms of updaters and selectors.

But it's important to keep your components focused on UI — you don't want 200 lines of logic in the `onClick` event of a button. So there will come a point where moving code out of your components into dedicated files is necessary, and these two concepts will go a long way toward keeping your codebase under control.

## Directory structure

Here's a simple starting point for a directory structure:

```
/my-app
 └─ src
    ├─ components
    ├─ store
    │  ├─ selectors
    │  └─ updaters
    └─ utils
```

Everything to do with UI is in one directory. Everything to do with data in another. Then inevitably you'll have things like utils and constants and so on.

This will work well for small-to-medium sized apps. But if your app has several distinct areas with very little shared code, or hundreds of components, you may want to group components/selectors/updaters together for each of these distinct areas.

For example, if a site had 'admin' and 'products' sections with not much shared, we might break it up like so:

```
/my-app
└─ src
   ├─ admin
   │  ├─ components
   │  ├─ store
   │  │  ├─ selectors
   │  │  └─ updaters
   │  └─ utils
   ├─ common
   │  ├─ components
   │  ├─ store
   │  │  ├─ selectors
   │  │  └─ updaters
   │  └─ utils
   └─ products
      ├─ components
      ├─ store
      │  ├─ selectors
      │  └─ updaters
      └─ utils
```

Ultimately, it's more important to be consistent across your codebase than it is to be consistent with the examples on this page.

## Selectors

Reading from a JavaScript object is pretty simple, so many apps won't ever need to bother with selectors. But for more complex operations like 'get all products under $40, sorted by price', selectors will be your friend.

Read more about selectors in selectors-pattern.md (coming soon!)

## Updaters

Updaters have more work to do than selectors, because they will often read from, or write to, an external resource like the network.

Read more about updaters in [updater-pattern.md](./updater-pattern.md)