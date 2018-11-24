const DEBUG_ON = 'on';
const DEBUG_OFF = 'off';

const isInBrowser = typeof window !== 'undefined';

let DEBUG = isInBrowser
  ? (window.localStorage.RECOLLECT__DEBUG || DEBUG_OFF)
  : DEBUG_OFF;

export const debugOn = () => {
  DEBUG = DEBUG_ON;
  if (isInBrowser) window.localStorage.RECOLLECT__DEBUG = DEBUG;
};

export const debugOff = () => {
  DEBUG = DEBUG_OFF;
  if (isInBrowser) window.localStorage.RECOLLECT__DEBUG = DEBUG;
};

export const isDebugOn = () => DEBUG === DEBUG_ON;
