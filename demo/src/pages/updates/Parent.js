import React from 'react';
import { collect } from 'react-recollect';
import StorePropType from '../../propTypes/StorePropType';
import Child from './Child';

class Parent extends React.Component {
  renderCount = 1;

  render() {
    const { text } = this.props.store.batchUpdatePage;

    return (
      <div>
        <h1>{`Parent renders: ${this.renderCount++}`}</h1>
        <h2>{`Parent value: ${text}`}</h2>
        <Child fromParent={`${text}!`} />
      </div>
    );
  }
}

Parent.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(Parent);
