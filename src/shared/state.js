/**
 * Any state shared between modules goes here
 */
export default {
  /** @type {CollectorComponent} */
  currentComponent: null,
  isInBrowser: typeof window !== 'undefined',
  /** @type {Map<string, Set<CollectorComponent>>} */
  listeners: new Map(),
  manualListeners: [],
  nextStore: null,
  proxyIsMuted: false,
  store: null,
};
