import { debugOff, debugOn } from 'src/shared/debug';
import state from 'src/shared/state';

export { default as collect } from 'src/collect';
export { afterChange } from 'src/updating';
export { initStore, batch } from 'src/store';
export const { store } = state;

if (typeof window !== 'undefined') {
  if ('Proxy' in window) {
    // TODO (davidg): getStore() and getListeners() can go.
    //  Requires a major bump, technically. Deprecate them for a version
    window.__RR__ = {
      debugOn,
      debugOff,
      internals: state,
      getStore: () => {
        console.warn(
          '__RR__.getStore() will be removed in v4. Use __RR__.internals.store instead'
        );
        return state.store;
      },
      getListeners: () => {
        console.warn(
          '__RR__.getListeners() will be removed in v4. Use __RR__.internals.listeners instead'
        );
        return state.listeners;
      },
    };
  } else {
    console.warn(
      "This browser doesn't support the Proxy object, which react-recollect needs. See https://caniuse.com/#search=proxy to find out which browsers do support it"
    );
  }
}
