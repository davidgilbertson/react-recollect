import * as React from 'react';

interface WithStoreProp {
  store: object;
}

interface CollectorComponent extends React.PureComponent {
  update(store: object): void,
  _name: string,
}

export function collect<P extends object>(Component: React.ComponentType<P>): React.PureComponent<P & WithStoreProp>;

export const store: object;

export function afterChange(callback: (
  newStore: object,
  propPath: string,
  updated: CollectorComponent[],
  oldStore: object
) => void): void;
