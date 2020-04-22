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

/**
 * The internal state of Recollect. For internal/debugging use only.
 */
export type State = {
  currentComponent: CollectorComponent | null;
  isBatchUpdating: boolean;
  isInBrowser: boolean;
  listeners: Map<string, Set<CollectorComponent>>;
  manualListeners: ((e: AfterChangeEvent) => void)[];
  /** Records the next version of any target */
  nextVersionMap: WeakMap<Target, Target>;
  proxyIsMuted: boolean;
  /** Usually true, this will redirect reads to the latest version of the store */
  redirectToNext: boolean;
  store: Store;
};

// For clarity. The path can contain anything that can be a Map key.
export type PropPath = any[];

export type UpdateInStoreProps = {
  target: Target;
  prop?: any;
  notifyTarget?: boolean;
  value?: any;
  /** The updater must return the result of Reflect for the active trap */
  updater: (target: Target, value: any) => any;
};

// This returns whatever the updater returns
export type UpdateInStore = {
  (props: UpdateInStoreProps): any;
};

/**
 * All proxyable objects have these shared keys.
 */
interface SharedBase<T> {
  [PATH]?: PropPath;
  [ORIGINAL]?: T;
  [p: string]: any;
  [p: number]: any;
  // [p: symbol]: any; // one day, we'll be able to do this - https://github.com/microsoft/TypeScript/issues/1863
}

export type ObjWithSymbols = SharedBase<ObjWithSymbols> & object;
export type ArrWithSymbols = SharedBase<ArrWithSymbols> & any[];
export type MapWithSymbols = SharedBase<MapWithSymbols> & Map<any, any>;
export type SetWithSymbols = SharedBase<SetWithSymbols> & Set<any>;

/**
 * A Target is any item that can be proxied
 */
export type Target =
  | ObjWithSymbols
  | ArrWithSymbols
  | MapWithSymbols
  | SetWithSymbols;
