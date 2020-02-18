import { debugOff, debugOn } from './debug';
import { getListeners } from './updating';
import { getStore } from './store';

export { afterChange } from './updating';
export { collect } from './collect';
export { store, initStore } from './store';

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
