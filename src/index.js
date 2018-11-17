import React from 'react';
import { debugOff, debugOn } from './debug';
import { afterChange, getListeners } from './updating';
import { getStore } from './store';

export { afterChange } from './updating';
export { collect } from './collect';
export { store } from './store';

if (!window.Proxy) {
  console.warn('This browser doesn\'t support the Proxy object, which react-recollect needs. See https://caniuse.com/#search=proxy to find out which browsers do support it');
}

window.__RR__ = {
  getStore,
  getListeners,
  debugOn,
  debugOff,
};
