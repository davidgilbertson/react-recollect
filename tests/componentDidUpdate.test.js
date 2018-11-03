import React, { Component } from 'react';
import { render } from 'react-testing-library';
import { collect, store } from '../lib';

class RawClassComponent extends Component {
  constructor(props) {
    super(props);

    this.lastUserId = store.userId;
  }

  componentDidUpdate() {
    if (store.userId !== this.lastUserId) {
      this.lastUserId = store.userId;
      this.props.fetchData();
    }
  }

  render () {
    return (
      <div>
        <button onClick={() => {
          store.userId++;
        }}>
          Switch user
        </button>
      </div>
    );
  }
}

const ClassComponent = collect(RawClassComponent);

const fetchData = jest.fn();

// Recollect doesn't do immutability, so a slightly hacky approach is required to detect a change
// in a value between renders
it('should handle a change in a value', () => {
  store.userId = 1;

  const { getByText } = render(<ClassComponent fetchData={fetchData} />);

  expect(fetchData).toHaveBeenCalledTimes(0);

  getByText('Switch user').click();

  expect(fetchData).toHaveBeenCalledTimes(1);
});
