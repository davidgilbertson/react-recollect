import { CollectorComponent, Target } from './types';
import * as paths from './paths';
import * as ls from './ls';
import * as utils from './utils';
import state from './state';
import { LS_KEYS } from './constants';

const DEBUG_ON = 'on';
const DEBUG_OFF = 'off';

let DEBUG = ls.get(LS_KEYS.RR_DEBUG) || DEBUG_OFF;

if (DEBUG === DEBUG_ON) {
  console.info(
    'Recollect debugging is enabled. Type __RR__.debugOff() to turn it off.'
  );
}

export const debugOn = () => {
  DEBUG = DEBUG_ON;
  ls.set(LS_KEYS.RR_DEBUG, DEBUG_ON);
};

export const debugOff = () => {
  DEBUG = DEBUG_OFF;
  ls.set(LS_KEYS.RR_DEBUG, DEBUG_OFF);
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

type NameMaker = (obj: any) => string;
type Matcher = string | RegExp;

const getComponentsAndListeners = (
  componentFirst: boolean,
  matcher?: Matcher,
  makeName?: NameMaker
) => {
  const result: { [p: string]: string[] } = {};

  Array.from(state.listeners).forEach(([path, componentSet]) => {
    componentSet.forEach((component) => {
      let componentName = component._name;
      if (makeName) {
        componentName += makeName(component.props) ?? '';
      }
      const userPath = paths.internalToUser(path);

      const prop = componentFirst ? componentName : userPath;
      const value = componentFirst ? userPath : componentName;

      if (matcher && !prop.match(matcher)) return;

      if (!result[prop]) result[prop] = [];
      if (!result[prop].includes(value)) result[prop].push(value);
    });
  });

  return result;
};

/**
 * Return an object where the keys are component names and the values are
 * arrays of the store properties the component is subscribed to
 */
export const getListenersByComponent = (
  matcher?: Matcher,
  makeName?: NameMaker
) => getComponentsAndListeners(true, matcher, makeName);

/**
 * Return an object where the keys are store properties and the values are
 * the names of the components that listen to the property
 */
export const getComponentsByListener = (
  matcher?: Matcher,
  makeName?: NameMaker
) => getComponentsAndListeners(false, matcher, makeName);
