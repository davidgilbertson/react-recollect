import { CollectorComponent, Target } from './types';
import * as paths from './paths';
import * as utils from './utils';
import state from './state';

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

export const logGet = (target: Target, prop?: any, value?: any) => {
  debug(() => {
    console.groupCollapsed(`GET: ${paths.extendToUserString(target, prop)}`);
    console.info(`Component: <${state.currentComponent!._name}>`);
    if (typeof value !== 'undefined') {
      console.info('Value:', value);
    }
    console.groupEnd();
  });
};

export const logSet = (target: Target, prop: any, value?: any) => {
  debug(() => {
    console.groupCollapsed(`SET: ${paths.extendToUserString(target, prop)}`);
    console.info('From:', utils.getValue(target, prop));
    console.info('To:  ', value);
    console.groupEnd();
  });
};

export const logDelete = (target: Target, prop: any) => {
  debug(() => {
    console.groupCollapsed(`DELETE: ${paths.extendToUserString(target, prop)}`);
    console.info('Property: ', paths.extendToUserString(target, prop));
    console.groupEnd();
  });
};

export const logUpdate = (
  component: CollectorComponent,
  propsUpdated: string[]
) => {
  debug(() => {
    console.groupCollapsed(`UPDATE:  <${component._name}>`);
    console.info('Changed properties:', propsUpdated);
    console.groupEnd();
  });
};
