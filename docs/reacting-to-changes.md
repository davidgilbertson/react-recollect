# Reacting to changes in the store
Recollect lets you subscribe to changes in the store by passing a function to `afterChange`. This will be called with four arguments each time the store changes:
- `newStore` - the new store
- `path` - the 'path' of the property that changed, e.g. `'store.tasks.1.done'`
- `updatedComponents` - an array of the React components that were updated. These components have a special `.update()` method.
- `oldStore` - the old store

To demonstrate, below is an example of a basic 'time travel' module.

```js
const thePast = [];
const theFuture = [];

window.TIME_TRAVEL = {
  back() {
    if (!thePast.length) return;

    const event = thePast.pop();
    theFuture.push(event);

    event.updatedComponents.forEach(component => {
      component.update(event.oldStore);
    });

    console.log('Replayed the change made to', event.path);
  },
  forward() {
    if (!theFuture.length) return;

    const event = theFuture.pop();
    thePast.push(event);

    event.updatedComponents.forEach(component => {
      component.update(event.newStore);
    });

    console.log('Replayed the change made to', event.path);
  },
};

export default function timeTravelMiddleware(newStore, path, updatedComponents, oldStore) {
  if (updatedComponents.length) {
    thePast.push({
      oldStore,
      newStore,
      updatedComponents,
      path,
    });
  }
};
```

That gives a pretty rough API of typing `TIME_TRAVEL.back()` and `TIME_TRAVEL.forward()` in the console to move through recent states in your app.

To consume this middleware, you'd do the following at the entry point to your app.

```js
import { afterChange } from 'react-recollect';
import timeTravelMiddleware from './timeTravelMiddleware';

afterChange(timeTravelMiddleware);
```

That's all there is to know about `afterChange`.
