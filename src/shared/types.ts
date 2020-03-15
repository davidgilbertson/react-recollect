import * as React from 'react';
import { ORIGINAL, PATH } from './constants';

/**
 * Define the shape of your store in your project - see README.md
 */
export interface Store {}

/**
 * Extend or intersect component `props` with `WithStoreProp`
 * when using `connect`
 */
export interface WithStoreProp {
  store: Store;
}

export interface CollectorComponent extends React.Component {
  update(): void;
  _name: string;
}

export type AfterChangeEvent = {
  /** The store props that changed */
  changedProps: string[];
  /** The store, after the change occurred */
  store: Store;
  /** Components updated as a result of the change */
  renderedComponents: CollectorComponent[];
};

export type State = {
  currentComponent: CollectorComponent | null;
  isBatchUpdating: boolean;
  isInBrowser: boolean;
  listeners: Map<string, Set<CollectorComponent>>;
  manualListeners: ((e: AfterChangeEvent) => void)[];
  /** Records the next version of any target */
  nextVersionMap: WeakMap<Target, Target>;
  proxyIsMuted: boolean;
  store: Store;
};

// For clarity. The path can contain anything that can be a Map key.
export type PropPath = any[];

export type UpdateInStoreProps = {
  target: Target;
  prop?: any;
  value?: any;
  updater: (target: Target, value: any) => void;
};

export type UpdateInStore = {
  (props: UpdateInStoreProps): void;
};

/**
 * All proxyable objects have these shared keys.
 */
type SharedBase = {
  [PATH]?: PropPath;
  [ORIGINAL]?: Target;
  [p: string]: any;
  [p: number]: any;
  // [p: symbol]: any; // one day, we'll be able to do this - https://github.com/microsoft/TypeScript/issues/1863
};

export type ObjWithSymbols = SharedBase & object;
export type ArrWithSymbols = SharedBase & any[];
export type MapWithSymbols = SharedBase & Map<any, any>;
export type SetWithSymbols = SharedBase & Set<any>;

/**
 * A Target is any item that can be proxied
 */
export type Target =
  | ObjWithSymbols
  | ArrWithSymbols
  | MapWithSymbols
  | SetWithSymbols;
