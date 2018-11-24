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

/**
 * Empty the Recollect store and replace it with new data.
 * Use this in conjunction with server rendering.
 * E.g. set window.__PRELOADED_STATE__ on the server, then
 * initStore(window.__PRELOADED_STATE__) just before calling
 * React.hydrate(<YourApp /> ...)
 */
export function initStore(data: Store);

/**
 * afterChange will be called each time the Recollect store changes
 */
export function afterChange(callback: (changeEvent: {
  store: Store,
  propPath: string,
  components: CollectorComponent[],
  prevStore: Store
}) => void): void;
