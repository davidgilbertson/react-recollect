import { debugOff, debugOn } from 'src/debug';
import { getListeners } from 'src/updating';
import { getStore } from 'src/store';

export { afterChange } from 'src/updating';
export { collect } from 'src/collect';
export { store, initStore } from 'src/store';

if (typeof window !== 'undefined') {
  if ('Proxy' in window) {
    window.__RR__ = {
      getStore,
      getListeners,
      debugOn,
      debugOff,
    };
  } else {
    console.warn(
      "This browser doesn't support the Proxy object, which react-recollect needs. See https://caniuse.com/#search=proxy to find out which browsers do support it"
    );
  }
}
