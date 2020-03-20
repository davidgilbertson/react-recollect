import { debugOff, debugOn } from './shared/debug';
import state from './shared/state';

export { default as collect } from './collect';
export { afterChange } from './shared/pubSub';
export { initStore, batch } from './store';
export { useProps } from './shared/utils';
export const { store } = state;

// `internals` is not part of the Recollect API. It is used by tests.
export const internals = state;

export { AfterChangeEvent } from './shared/types';
export { WithStoreProp } from './shared/types';
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
