import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { collect } from 'react-recollect';
import StorePropType from '../../propTypes/StorePropType';
import GridItem from './GridItem';
import Parent from './Parent';

const getGrid = () => (
  <Box flex={1} minWidth={0} clone>
    <GridItem id="101">
      <GridItem id="102">
        <GridItem id="103" />

        <GridItem id="104">
          <GridItem id="105" />
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
        <GridItem id="113">
          <GridItem id="114" />
        </GridItem>
      </GridItem>
    </GridItem>
  </Box>
);

const Updates = ({ store }) => (
  <Container>
    <Box p={1} mt={2} clone>
      <Paper elevation={1}>
        <Typography variant="h3">Targeted updates</Typography>
        <p>
          This is for testing/demonstrating components re-rendering only when
          their data changes. Best viewed not on a phone.
        </p>

        <p>
          Each box updates the store on mouse move, and re-renders when it’s
          data changes. When a box renders, it will flash its border. Note that
          when a component re-renders, it doesn’t mean that it’s children
          re-render too.
        </p>

        <p>RC = render count</p>

        <Box display="flex">
          {getGrid()}

          {getGrid()}
        </Box>
      </Paper>
    </Box>

    <Box p={2} mt={2} clone>
      <Paper elevation={2}>
        <Typography variant="h3">Batched updates</Typography>

        <p>
          This demonstrates updates to multiple components being batched into a
          single render cycle, even when the store change takes place outside a
          React event handler.
        </p>

        <hr />

        <p>
          The button below changes the store within an onClick handler. In this
          case, React will batch updates and trigger a single render by default
        </p>

        <button
          onClick={() => {
            store.batchUpdatePage.text += '×';
          }}
        >
          Increment
        </button>

        <hr />

        <p>
          The button below changes the store outside of a onClick handler (in a
          setTimeout callback). In this case, React can’t batch updates, but the
          batching is handled internally by Recollect.
        </p>

        <button
          onClick={() => {
            setTimeout(() => {
              store.batchUpdatePage.text += '×';
            });
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

Updates.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(Updates);
