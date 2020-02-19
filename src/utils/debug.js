const DEBUG_ON = 'on';
const DEBUG_OFF = 'off';

const hasLocalStorage =
  typeof window !== 'undefined' && window.localStorage !== undefined;

let DEBUG = hasLocalStorage
  ? window.localStorage.RECOLLECT__DEBUG || DEBUG_OFF
  : DEBUG_OFF;

export const debugOn = () => {
  DEBUG = DEBUG_ON;
  if (hasLocalStorage) window.localStorage.RECOLLECT__DEBUG = DEBUG;
};

export const debugOff = () => {
  DEBUG = DEBUG_OFF;
  if (hasLocalStorage) window.localStorage.RECOLLECT__DEBUG = DEBUG;
};

export const isDebugOn = () => DEBUG === DEBUG_ON;
