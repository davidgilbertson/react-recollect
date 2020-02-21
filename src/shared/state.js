/**
 * Any state shared between modules goes here
 */
export default {
  currentComponent: null,
  isInBrowser: typeof window !== 'undefined',
  listeners: {
    store: [],
  },
  manualListeners: [],
  nextStore: null,
  proxyIsMuted: false,
  store: null,
};
