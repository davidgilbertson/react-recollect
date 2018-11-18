import React, { Component } from 'react';
import { render, waitForElement } from 'react-testing-library';
import { collect } from '../../dist';

const TestComponent = collect(class extends Component {
  componentDidMount() {
    this.props.store.loading = true;

    setTimeout(() => {
      this.props.store.loading = false;
    }, 100);
  }

  render () {
    if (this.props.store.loading) return <h1>Loading...</h1>;

    return <h1>Loaded</h1>;
  }
});

const { getByText } = render(<TestComponent />);

it('should set loading state after mounting', () => {
  getByText('Loading...');
});

it('should set loading state after mounting', async () => {
  await waitForElement(() => (
    getByText('Loaded')
  ));
});
