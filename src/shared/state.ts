import { State } from './types';

/**
 * Any state shared between modules goes here
 * For internal use, not for consumers
 */
const state: State = {
  currentComponent: null,
  listeners: new Map(),
  manualListeners: [],
  nextStore: {},
  proxyIsMuted: false,
  isBatchUpdating: false,
  store: {},
};

export default state;
