import { getStore } from 'src/store';

import { debugOff, debugOn } from 'src/shared/debug';
import { getListeners } from 'src/shared/state';

export { default as collect } from 'src/collect';
export { afterChange } from 'src/updating';
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
