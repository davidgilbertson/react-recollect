import * as React from 'react';
import { IS_OLD_STORE, PATH_PATH_SYMBOL } from './constants';

/**
 * Define the shape of your store in your project - see README.
 */

export interface Store {}

export interface StoreUpdater {
  target: object;
  prop?: any;
  value?: any;
  updater: (target: any, value: any) => void;
}

/**
 * Extend or intersect component `props` with `WithStoreProp`
 * when using `connect`
 */
export interface WithStoreProp {
  store: Store;
  forwardedRef?: any;
}

export interface CollectorComponent extends React.Component {
  update(): void;
  _name: string;
}

export type CollectOptions = {
  forwardRef: boolean;
};

export type AfterChangeEvent = {
  store: Store;
  changedProps: string[];
  renderedComponents: CollectorComponent[];
  prevStore: Store;
};

export type State = {
  currentComponent: CollectorComponent | null;
  isInBrowser: boolean;
  isBatchUpdating: boolean;
  listeners: Map<string, Set<CollectorComponent>>;
  manualListeners: ((e: AfterChangeEvent) => void)[];
  nextStore: Store;
  proxyIsMuted: boolean;
  store: Store;
};

export type GeneralProp = string | number | symbol;

// For clarity. The path can contain anything that can be a Map key.
export type PropPath = any[];

type WithSymbols = {
  [PATH_PATH_SYMBOL]?: PropPath;
  [IS_OLD_STORE]?: boolean;
};

export type ObjWithSymbols = WithSymbols & { [p: string]: any };
export type ArrWithSymbols = WithSymbols & any[];
export type MapWithSymbols = WithSymbols & Map<any, any>;
export type SetWithSymbols = WithSymbols & Set<any>;

export type Target =
  | ObjWithSymbols
  | ArrWithSymbols
  | MapWithSymbols
  | SetWithSymbols;
