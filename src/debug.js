const DEBUG_ON = 'on';
const DEBUG_OFF = 'off';

let DEBUG = localStorage.getItem('RECOLLECT__DEBUG') || DEBUG_OFF;

export const debugOn = () => {
  DEBUG = DEBUG_ON;
  localStorage.setItem('RECOLLECT__DEBUG', DEBUG);
};

export const debugOff = () => {
  DEBUG = DEBUG_OFF;
  localStorage.setItem('RECOLLECT__DEBUG', DEBUG);
};

export const isDebugOn = () => DEBUG === DEBUG_ON;
