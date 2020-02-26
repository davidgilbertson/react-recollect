import { debugOff, debugOn } from 'src/shared/debug';
import state from 'src/shared/state';

export { default as collect } from 'src/collect';
export { afterChange } from 'src/updating';
export { initStore, batch } from 'src/store';
export const { store } = state;

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
