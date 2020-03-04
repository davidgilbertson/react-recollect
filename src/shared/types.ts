import * as React from 'react';
import { IS_OLD_STORE, IS_PROXY, PATH_PATH_SYMBOL } from './constants';

/**
 * Define the shape of your store in your project - see README.
 */
export interface Store {
  [IS_PROXY]?: boolean; // TODO (davidg): reuse SharedBase? Or 'true' here?
}

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

// For clarity. The path can contain anything that can be a Map key.
export type PropPath = any[];

/**
 * All proxyable objects have these shared keys.
 */
type SharedBase = {
  [PATH_PATH_SYMBOL]?: PropPath;
  [IS_OLD_STORE]?: boolean;
  [IS_PROXY]?: boolean;
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

/**
 * A Target is any item that can be proxied
 */
export type ProxiedTarget<T = Target> = T & {
  [IS_PROXY]?: true;
};

export const enum MapOrSetMembers {
  Add = 'add',
  Clear = 'clear',
  Delete = 'delete',
  Entries = 'entries',
  ForEach = 'forEach',
  Get = 'get',
  Has = 'has',
  Keys = 'keys',
  Set = 'set',
  Size = 'size',
  Values = 'values',
}
