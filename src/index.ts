import { debugOff, debugOn } from './shared/debug';
import state from './shared/state';

export { default as collect } from './collect';
export { afterChange } from './updating';
export { initStore, batch } from './store';
export const { store } = state;

export { AfterChangeEvent } from './shared/types';
export { CollectorComponent } from './shared/types';
export { WithStoreProp } from './shared/types';
export { State } from './shared/types';
export { Store } from './shared/types';

if (typeof window !== 'undefined') {
  if ('Proxy' in window) {
    window.__RR__ = {
      debugOn,
      debugOff,
      internals: state,
    };
  } else {
    console.warn(
      "This browser doesn't support the Proxy object, which react-recollect needs. See https://caniuse.com/#search=proxy to find out which browsers do support it"
    );
  }
}
