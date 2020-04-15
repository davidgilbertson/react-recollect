import Container from '@material-ui/core/Container';
import React from 'react';
import { collect } from 'react-recollect';
import StorePropType from '../../propTypes/StorePropType';
import Parent from './Parent';

class BatchedUpdates extends React.Component {
  renderCount = 1;

  update = () => {
    this.props.store.batchUpdatePage.text += '×';
  };

  render() {
    return (
      <Container>
        <h2>Render count: {this.renderCount++}</h2>

        <p>
          When functioning correctly, clicking either button below triggers only
          a single render for each component
        </p>

        <hr />
        <p>
          This changes the store within an onClick handler. In this case, React
          will batch updates and trigger a single render by default
        </p>
        <button onClick={this.update}>Increment</button>

        <hr />

        <p>
          This changes the store outside of a onClick handler (in a setTimeout
          callback). In this case, React can’t batch updates, but the batching
          is handled internally by Recollect.
        </p>
        <button
          onClick={() => {
            setTimeout(this.update);
          }}
        >
          Increment async
        </button>

        <hr />

        <Parent />
      </Container>
    );
  }
}

BatchedUpdates.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(BatchedUpdates);
