// let currentComponent;
//
// export const getCurrentComponent = () => currentComponent;
//
// export const setCurrentComponent = component => {
//   currentComponent = component;
// };

// let it = null;
// export const getIt = () => it;
// export const setIt = newIt => {
//   console.log('> setting a new it:', newIt);
//   it = newIt;
// };
//
// export const test = 'hi from state.js';

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
