/* eslint-disable react/prop-types */
/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { collect } from 'src';
import { expectToThrow } from 'tests/testUtils';

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
  expectToThrow(() => {
    render(<TestComponentBad />);
  });
});

it('should set loading state after mounting', async () => {
  const { findByText } = render(<TestComponentGood />);

  await findByText('Loading...');

  await findByText('Loaded');
});
