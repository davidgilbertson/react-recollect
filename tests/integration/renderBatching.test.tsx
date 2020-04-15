// eslint-disable-next-line max-classes-per-file
import React from 'react';
import * as testUtils from '../testUtils';
import { collect, store as globalStore, WithStoreProp } from '../..';

declare module '../..' {
  interface Store {
    propNum: number;
  }
}

it('should combine updates into a single render', () => {
  type ChildProps = WithStoreProp & {
    fromParent: string;
  };

  const Child = collect(
    class ChildComponentRaw extends React.Component<ChildProps> {
      renderCount = 1;

      render() {
        return (
          <div>
            <h1>Child</h1>
            <h2>{`Child render count: ${this.renderCount++}`}</h2>
            <h2>{`Child value: ${this.props.store.value}`}</h2>
            <h2>{`Child value fromParent: ${this.props.fromParent}`}</h2>
          </div>
        );
      }
    }
  );

  class Parent extends React.Component<WithStoreProp> {
    renderCount = 1;

    render() {
      return (
        <div>
          <h1>Parent</h1>
          <h2>{`Parent render count: ${this.renderCount++}`}</h2>
          <h2>{`Parent value: ${this.props.store.value}`}</h2>

          <Child fromParent={`${this.props.store.value}!`} />
        </div>
      );
    }
  }

  const { getByText } = testUtils.collectAndRender(Parent);

  getByText('Parent render count: 1');
  getByText('Child render count: 1');

  // Simulate external change (not from within a React-handled click event)
  globalStore.value = 'x';
  // Changing the store will trigger:
  // - an update of <Parent> (because it's collected),
  //   which in turn would trigger an update of <Child> (prop passed down)
  // - an update of <Child> (because it's collected)

  // If we didn't batch multiple component updates into a single render,
  // we'd get two <Child> renders
  getByText('Parent render count: 2');
  getByText('Parent value: x');
  getByText('Child render count: 2'); // Just 1 more. Good.
  getByText('Child value: x');
  getByText('Child value fromParent: x!');

  globalStore.value = 'y';

  getByText('Parent render count: 3');
  getByText('Parent value: y');
  getByText('Child render count: 3');
  getByText('Child value: y');
  getByText('Child value fromParent: y!');
});
