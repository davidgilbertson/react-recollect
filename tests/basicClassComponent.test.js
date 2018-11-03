import React, { Component } from 'react';
import { render } from 'react-testing-library';
import { collect, store } from '../lib';

class RawClassComponent extends Component {
  render () {
    return (
      <div>
        <h1>{store.title}</h1>
        <p>Button was pressed {store.clickCount} times</p>
        <button onClick={() => {
          store.clickCount++;
        }}>
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
  const { getByText } = render(<ClassComponent />);

  expect(getByText('The initial title'));

  // External change
  store.title = 'The updated title';

  expect(getByText('The updated title'));
});

it('should render and update the click count', () => {
  const { getByText } = render(<ClassComponent />);

  expect(getByText('Button was pressed 3 times'));

  getByText('Click me').click();

  expect(getByText('Button was pressed 4 times'));
});
