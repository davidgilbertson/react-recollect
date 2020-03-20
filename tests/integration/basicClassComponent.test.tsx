import React, { Component } from 'react';
import { collect, store, WithStoreProp } from '../..';
import * as testUtils from '../testUtils';

// eslint-disable-next-line react/prefer-stateless-function
class RawClassComponent extends Component<WithStoreProp> {
  render() {
    return (
      <div>
        <h1>{this.props.store.title}</h1>
        <p>Button was pressed {this.props.store.clickCount} times</p>
        <button
          onClick={() => {
            this.props.store.clickCount++;
          }}
        >
          Click me
        </button>
      </div>
    );
  }
}

const ClassComponent = collect(RawClassComponent);

store.title = 'The initial title';
store.clickCount = 3;

it('should render and update the title', () => {
  const { getByText } = testUtils.renderStrict(<ClassComponent />);

  expect(getByText('The initial title'));

  // External change
  store.title = 'The updated title';

  expect(getByText('The updated title'));
});

it('should render and update the click count', () => {
  const { getByText } = testUtils.renderStrict(<ClassComponent />);

  expect(getByText('Button was pressed 3 times'));

  getByText('Click me').click();

  expect(getByText('Button was pressed 4 times'));
});
