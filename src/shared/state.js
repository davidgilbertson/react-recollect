// TODO (davidg): consider a simple state object, without named get/set methods.
import { PROP_PATH_SEP } from 'src/shared/constants';

let currentComponent;

export const getCurrentComponent = () => currentComponent;

export const setCurrentComponent = component => {
  currentComponent = component;
};

let proxyIsMuted = false;

/**
 * Mutes reads/writes to the proxied store
 * Do this to silence reads/writes that happen inside Recollect. The proxy only needs to listen
 * to changes happening in a user's code
 */
export const muteProxy = () => {
  proxyIsMuted = true;
};

/**
 * Un-mute the proxy
 */
export const unMuteProxy = () => {
  proxyIsMuted = false;
};

/**
 * Is proxy muting currently turned on?
 * @returns {boolean}
 */
export const isProxyMuted = () => proxyIsMuted;

/*  --  listeners  --  */
const listeners = {
  store: [],
};

const manualListeners = [];

export const getListeners = () => listeners;
export const getManualListeners = () => manualListeners;
export const addManualListener = listener => {
  manualListeners.push(listener);
};

/**
 * Add a new listener to be notified when a particular value in the store changes
 * To be used when a component reads from a property
 * @param {Array<*>} pathArray
 */
export const addListener = pathArray => {
  if (!currentComponent) return;

  // We use a string instead of an array because it's much easier to match
  const pathString = pathArray.join(PROP_PATH_SEP);

  // TODO (davidg): consider Map instead of array? Easier to delete a component?
  //  could be like this, but as a Map
  // const listeners = {
  //   'path~~~as~~~string': {
  //     pathArray: ['path', 'as', 'string'],
  //     components: [],
  //   }
  // }

  if (listeners[pathString]) {
    listeners[pathString].push(currentComponent);
  } else {
    listeners[pathString] = [currentComponent];
  }
};
