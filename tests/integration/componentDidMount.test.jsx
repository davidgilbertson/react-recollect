/* eslint-disable react/prop-types */
/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { collect } from 'src';

const TestComponentBad = collect(
  class extends Component {
    componentDidMount() {
      this.props.store.loading = true;

      setTimeout(() => {
        this.props.store.loading = false;
      }, 100);
    }

    render() {
      if (this.props.store.loading) return <h1>Loading...</h1>;

      return <h1>Loaded</h1>;
    }
  }
);

const TestComponentGood = collect(
  class extends Component {
    componentDidMount() {
      setTimeout(() => {
        this.props.store.loading = true;

        setTimeout(() => {
          this.props.store.loading = false;
        }, 100);
      });
    }

    render() {
      if (this.props.store.loading) return <h1>Loading...</h1>;

      return <h1>Loaded</h1>;
    }
  }
);

it('should fail if setting the state during mounting', () => {
  // Even though the error is caught, it still gets printed to the console
  // so we mock that out to keep the wall of red out of the console.
  jest.spyOn(console, 'error');
  console.error.mockImplementation(() => {});

  expect(() => {
    render(<TestComponentBad />);
  }).toThrow(
    `You are modifying the store during a render cycle. Don't do this.
        You're setting "loading" to "true" somewhere, we can't tell were.
        If you must, wrap your code in a setTimeout() to allow the render
        cycle to complete before changing the store.`
  );

  console.error.mockRestore();
});

it('should set loading state after mounting', async () => {
  const { findByText } = render(<TestComponentGood />);

  await findByText('Loading...');

  await findByText('Loaded');
});
