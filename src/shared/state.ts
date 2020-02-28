import { State } from '../types/state';

/**
 * Any state shared between modules goes here
 * For internal use, not for consumers
 */
const state: State = {
  currentComponent: null,
  isInBrowser: typeof window !== 'undefined',
  listeners: new Map(),
  manualListeners: [],
  nextStore: {},
  proxyIsMuted: false,
  isBatchUpdating: false,
  store: {},
};

export default state;