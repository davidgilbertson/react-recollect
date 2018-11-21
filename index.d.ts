import * as React from 'react';

/**
 * Define the shape of your store in your project - see README.
 */
export interface Store {
}

/**
 * Extend or intersect component `props` with `WithStoreProp`
 * when using `connect`
 */
export interface WithStoreProp {
  store: Store;
}

export interface CollectorComponent extends React.Component {
  update(store: Store): void,
  _name: string,
}

// `collect` uses Exclude so that TS doesn't complain
// about undefined store prop when you use your component
// Exclude requires TypeScript > 2.8
/**
 * Provide the `store: Store` object as a prop to wrapped component
 */
export function collect<P extends WithStoreProp>(
  Component: React.ComponentType<P>
): React.ComponentType<Pick<P, Exclude<keyof P, keyof WithStoreProp>>>;

export const store: Store;

export function afterChange(callback: (
  store: Store,
  propPath: string,
  updated: CollectorComponent[],
  oldStore: Store
) => void): void;
