const DEBUG_ON = 'on';
const DEBUG_OFF = 'off';

const hasLocalStorage = typeof window !== 'undefined' && !!window.localStorage;

let DEBUG = hasLocalStorage
  ? window.localStorage.RECOLLECT__DEBUG || DEBUG_OFF
  : DEBUG_OFF;

if (DEBUG === DEBUG_ON) {
  console.info(
    'Recollect debugging is enabled. Type __RR__.debugOff() to turn it off.'
  );
}

export const debugOn = () => {
  DEBUG = DEBUG_ON;
  if (hasLocalStorage) window.localStorage.RECOLLECT__DEBUG = DEBUG;
};

export const debugOff = () => {
  DEBUG = DEBUG_OFF;
  if (hasLocalStorage) window.localStorage.RECOLLECT__DEBUG = DEBUG;
};

export const debug = (cb: () => void) => {
  if (DEBUG === DEBUG_ON) cb();
};
