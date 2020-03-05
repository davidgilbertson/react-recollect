import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { collect, store as globalStore, WithStoreProp } from '../../src';

type Props = {
  visibility: string;
};

const ChildComponent = (props: Props) => (
  <div>This component should be {props.visibility}</div>
);

// eslint-disable-next-line react/prefer-stateless-function
class RawClassComponent extends Component<WithStoreProp> {
  render() {
    const { store } = this.props;

    return (
      <div>
        <button
          onClick={() => {
            store.clickCount++;
          }}
        >
          Click me
        </button>

        <ChildComponent
          visibility={store.clickCount === 0 ? 'hidden' : 'shown'}
        />
      </div>
    );
  }
}

const ClassComponent = collect(RawClassComponent);

it('should update a child component not wrapped in collect()', () => {
  globalStore.clickCount = 0;

  const { getByText } = render(<ClassComponent />);

  expect(getByText('This component should be hidden'));

  getByText('Click me').click();

  expect(getByText('This component should be shown'));
});
