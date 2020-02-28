import * as React from 'react';
import { Store } from './store';

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
