import React, { Component } from 'react';
import { render } from 'react-testing-library';
import { collect, store } from '../../dist';

class RawClassComponent extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.store.userId !== prevProps.store.userId) {
      this.props.fetchData();
    }
  }

  render () {
    return (
      <div>
        <p>User ID: {this.props.store.userId}</p>
        <button onClick={() => {
          this.props.store.userId++;
        }}>
          Switch user
        </button>
      </div>
    );
  }
}

const ClassComponent = collect(RawClassComponent);

const fetchData = jest.fn();

it('should handle a change in a value', () => {
  store.userId = 1;

  const { getByText } = render(<ClassComponent fetchData={fetchData} />);

  expect(fetchData).toHaveBeenCalledTimes(0);

  getByText('Switch user').click();

  expect(fetchData).toHaveBeenCalledTimes(1);
});

// it should listen for changes on props not called in the render() method.
// for example, if this.props.store.userId is read in componentDidUpdate but not in render()
// then currently it won't be subscribed to changes.
// I have no idea how to do this.
// Oh, can I wrap a component in a proxy, then call all it's lifecycle methods and catch the reads
// of the store?
