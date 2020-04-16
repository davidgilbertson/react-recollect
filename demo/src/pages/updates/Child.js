import React from 'react';
import { collect, PropTypes } from 'react-recollect';
import StorePropType from '../../propTypes/StorePropType';

class Child extends React.Component {
  renderCount = 1;

  render() {
    const { text } = this.props.store.batchUpdatePage;

    return (
      <div>
        <h1>{`Child renders: ${this.renderCount++}`}</h1>
        <h2>{`Child value: ${text}`}</h2>
        <h2>{`Child value fromParent: ${this.props.fromParent}`}</h2>
      </div>
    );
  }
}

Child.propTypes = {
  fromParent: PropTypes.string.isRequired,
  store: StorePropType.isRequired,
};

export default collect(Child);
