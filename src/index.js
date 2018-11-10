import React from 'react';
import { debugOff, debugOn } from './logging';
import { afterChange, getListeners } from './updating';
import { getStore } from './store';

export { afterChange } from './updating';
export { collect } from './collect';
export { store } from './store';

window.__RR__ = {
  getStore,
  getListeners,
  debugOn,
  debugOff,
};
