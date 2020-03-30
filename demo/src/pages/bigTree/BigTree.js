import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import TreeView from '@material-ui/lab/TreeView';
import React from 'react';
import { collect } from 'react-recollect';
import StorePropType from '../../propTypes/StorePropType';
import Item from './Item';
import { stringifyPlus } from './utils';

const BigTree = (props) => {
  const { expandedNodeIds, tree } = props.store.bigTreePage;

  return (
    <Container>
      <Box p={4} clone>
        <Typography variant="body1" component="p">
          This page is for internal testing and won‘t make a lot of sense to the
          casual observer.
        </Typography>
      </Box>

      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
        expanded={Array.from(expandedNodeIds)}
      >
        <Item item={tree} expandedNodeIds={expandedNodeIds} />
      </TreeView>

      <hr />
      <pre
        style={{
          maxHeight: 400,
          overflow: 'scroll',
        }}
      >
        {stringifyPlus(tree)}
      </pre>
    </Container>
  );
};

BigTree.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(BigTree);
