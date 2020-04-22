import { State } from './types';

/**
 * Any state shared between modules goes here
 * For internal use, not for consumers
 */
const state: State = {
  currentComponent: null,
  isBatchUpdating: false,
  isInBrowser: typeof window !== 'undefined',
  listeners: new Map(),
  manualListeners: [],
  nextVersionMap: new WeakMap(),
  proxyIsMuted: false,
  redirectToNext: true,
  store: {},
};

export default state;
