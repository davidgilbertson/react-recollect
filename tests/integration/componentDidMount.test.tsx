/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { expectToThrow } from '../testUtils';
import { collect, WithStoreProp } from '../../src';

const TestComponentBad = collect(
  class extends Component<WithStoreProp> {
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
  class extends Component<WithStoreProp> {
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
  expectToThrow(() => {
    render(<TestComponentBad />);
  });
});

it('should set loading state after mounting', async () => {
  const { findByText } = render(<TestComponentGood />);

  await findByText('Loading...');

  await findByText('Loaded');
});
