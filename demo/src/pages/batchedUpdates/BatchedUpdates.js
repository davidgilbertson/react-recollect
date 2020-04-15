import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { collect } from 'react-recollect';
import StorePropType from '../../propTypes/StorePropType';
import GridItem from './GridItem';
import Parent from './Parent';

class BatchedUpdates extends React.Component {
  renderCount = 1;

  update = () => {
    this.props.store.batchUpdatePage.text += '×';
  };

  render() {
    return (
      <Container>
        <Box p={2} mt={2} clone>
          <Paper elevation={2}>
            <Typography variant="h3">Targeted updates</Typography>
            <p>This demonstrates components updating independently.</p>

            <p>
              Each box reads from a different part of the store and each box
              updates the store on mouse move.
            </p>

            <p>R = render count</p>

            <GridItem id="101">
              <GridItem id="102">
                <GridItem id="103" />

                <GridItem id="104">
                  <GridItem id="105" />
                  <GridItem id="106" />
                </GridItem>
              </GridItem>

              <GridItem id="107">
                <GridItem id="108">
                  <GridItem id="109">
                    <GridItem id="110">
                      <GridItem id="111" />
                    </GridItem>
                  </GridItem>
                </GridItem>
              </GridItem>
              <GridItem id="112">
                <GridItem id="113" />
                <GridItem id="114" />
              </GridItem>
              <GridItem id="115" />
            </GridItem>
          </Paper>
        </Box>

        <Box p={2} mt={2} clone>
          <Paper elevation={2}>
            <Typography variant="h3">Batched updates</Typography>

            <h2>Render count: {this.renderCount++}</h2>

            <p>
              When functioning correctly, clicking either button below triggers
              only a single render for each component
            </p>

            <hr />

            <p>
              This changes the store within an onClick handler. In this case,
              React will batch updates and trigger a single render by default
            </p>

            <button onClick={this.update}>Increment</button>

            <hr />

            <p>
              This changes the store outside of a onClick handler (in a
              setTimeout callback). In this case, React can’t batch updates, but
              the batching is handled internally by Recollect.
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
          </Paper>
        </Box>
      </Container>
    );
  }
}

BatchedUpdates.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(BatchedUpdates);
