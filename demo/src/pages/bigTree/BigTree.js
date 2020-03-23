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

const BigTree = (props) => {
  return (
    <Container>
      <Box p={4} clone>
        <Typography variant="body1" component="p">
          This page is primarily for internal testing and won‘t make a lot of
          sense to the casual observer.
        </Typography>
      </Box>

      <TreeView
        defaultCollapseIcon={<ExpandMoreIcon />}
        defaultExpandIcon={<ChevronRightIcon />}
      >
        <Item
          item={props.store.bigTreePage.tree}
          NON_EXISTENT_PROP_TOP_NOT_REQUIRED={{}}
          NON_EXISTENT_PROP_TOP_REQUIRED={1234}
        />
      </TreeView>
    </Container>
  );
};

BigTree.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(BigTree);
