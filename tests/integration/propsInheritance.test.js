/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { collect, store } from '../../src';

const ChildComponent = props => (
  <div>This component should be {props.visibility}</div>
);

// eslint-disable-next-line react/prefer-stateless-function
class RawClassComponent extends Component {
  render() {
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
  store.clickCount = 0;

  const { getByText } = render(<ClassComponent />);

  expect(getByText('This component should be hidden'));

  getByText('Click me').click();

  expect(getByText('This component should be shown'));
});
