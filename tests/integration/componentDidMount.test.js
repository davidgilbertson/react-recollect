/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { collect } from '../../src';

const TestComponent = collect(
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

it('should set loading state after mounting', async () => {
  const { findByText, getByText } = render(<TestComponent />);

  getByText('Loading...');

  await findByText('Loaded');
});
