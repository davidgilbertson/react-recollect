import {
  debugOff,
  debugOn,
  getComponentsByListener,
  getListenersByComponent,
} from './shared/debug';
import state from './shared/state';

export { default as collect } from './collect';
export { afterChange } from './shared/pubSub';
export { initStore, batch } from './store';
export { useProps } from './shared/utils';
export { default as PropTypes } from './shared/propTypes';
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

    // These helpers will be included in the dev build only. A) for size, but
    // also B) in prod, component names tend to be obscured so they would be
    // of little use.
    if (process.env.NODE_ENV !== 'production') {
      window.__RR__.getListenersByComponent = getListenersByComponent;
      window.__RR__.getComponentsByListener = getComponentsByListener;
    }
  } else {
    console.warn(
      "This browser doesn't support the Proxy object, which react-recollect needs. See https://caniuse.com/#search=proxy to find out which browsers do support it"
    );
  }
}
