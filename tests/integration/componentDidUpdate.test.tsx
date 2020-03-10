// eslint-disable-next-line max-classes-per-file
import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { collect, store as globalStore, WithStoreProp } from '../../src';

interface Props extends WithStoreProp {
  reportUserChange: (comp: string, prev: number, next: number) => {};
}

// This test has multiple collected components to test a specific scenario
// https://github.com/davidgilbertson/react-recollect/issues/82

const LevelTwo = collect(
  class LevelTwoRaw extends Component<Props> {
    componentDidUpdate(prevProps: Props) {
      this.props.reportUserChange(
        'LevelTwo',
        prevProps.store.userId,
        this.props.store.userId
      );
    }

    render() {
      return <p>User ID: {this.props.store.userId}</p>;
    }
  }
);

const LevelOneA = collect(
  class LevelOneARaw extends Component<Props> {
    componentDidUpdate(prevProps: Props) {
      this.props.reportUserChange(
        'LevelOneA',
        prevProps.store.userId,
        this.props.store.userId
      );
    }

    render() {
      return (
        <div>
          <p>User ID: {this.props.store.userId}</p>

          <LevelTwo {...this.props} />
        </div>
      );
    }
  }
);

const LevelOneB = collect(
  class LevelOneBRaw extends Component<Props> {
    componentDidUpdate(prevProps: Props) {
      this.props.reportUserChange(
        'LevelOneB',
        prevProps.store.userId,
        this.props.store.userId
      );
    }

    render() {
      return <p>User ID: {this.props.store.userId}</p>;
    }
  }
);

const ParentComponent = collect(
  class ParentComponentRaw extends Component<Props> {
    componentDidUpdate(prevProps: Props) {
      this.props.reportUserChange(
        'ParentComponentRaw',
        prevProps.store.userId,
        this.props.store.userId
      );
    }

    render() {
      return (
        <div>
          <p>User ID: {this.props.store.userId}</p>
          <button
            onClick={() => {
              this.props.store.userId++;
            }}
          >
            Switch user
          </button>

          <LevelOneA {...this.props} />
          <LevelOneB {...this.props} />
        </div>
      );
    }
  }
);

const reportUserChange = jest.fn();

it('should handle a change in a value', () => {
  globalStore.userId = 1;

  const { getByText } = render(
    <ParentComponent
      reportUserChange={reportUserChange}
    />
  );

  expect(reportUserChange).toHaveBeenCalledTimes(0);

  getByText('Switch user').click();

  expect(reportUserChange).toHaveBeenCalledTimes(4);

  expect(reportUserChange).toHaveBeenNthCalledWith(1, 'LevelTwo', 1, 2);
  expect(reportUserChange).toHaveBeenNthCalledWith(2, 'LevelOneA', 1, 2);
  expect(reportUserChange).toHaveBeenNthCalledWith(3, 'LevelOneB', 1, 2);
  expect(reportUserChange).toHaveBeenNthCalledWith(
    4,
    'ParentComponentRaw',
    1,
    2
  );
});

// it should listen for changes on props not called in the render() method.
// for example, if this.props.store.userId is read in componentDidUpdate but not in render()
// then currently it won't be subscribed to changes.
// I have no idea how to do this.
// Oh, can I wrap a component in a proxy, then call all it's lifecycle methods and catch the reads
// of the store?
