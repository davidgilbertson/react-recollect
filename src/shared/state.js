/**
 * Any state shared between modules goes here
 */
export default {
  currentComponent: null,
  proxyIsMuted: false,
  listeners: {
    store: [],
  },
  manualListeners: [],
  nextStore: null,
  store: null,
};
