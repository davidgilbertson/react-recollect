import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import { Delete } from '@material-ui/icons';
import TreeItem from '@material-ui/lab/TreeItem';
import PropTypes from 'prop-types';
import React from 'react';
import { TYPES } from '../todomvc/constants';
import { makeItem } from './utils';

const Item = (props) => {
  const { childrenType, parentType } = props.item;
  const nodeId = props.item.id.toString();
  const isSetItem = parentType === TYPES.SET;

  const addChild = (newItem) => {
    if (childrenType === TYPES.OBJ) {
      props.item.children[newItem.id] = newItem;
    } else if (childrenType === TYPES.ARR) {
      props.item.children.push(newItem);
    } else if (childrenType === TYPES.MAP) {
      props.item.children.set(newItem.id, newItem);
    } else if (childrenType === TYPES.SET) {
      props.item.children.add(newItem);
    }
  };

  const getChildrenAsArray = () => {
    if (childrenType === TYPES.OBJ) {
      return Array.from(Object.values(props.item.children));
    }
    if (childrenType === TYPES.ARR) {
      return props.item.children;
    }
    if (childrenType === TYPES.MAP) {
      return Array.from(props.item.children.values());
    }
    if (childrenType === TYPES.SET) {
      return Array.from(props.item.children);
    }

    throw Error('Unknown type');
  };

  const deleteChild = (child) => {
    if (childrenType === TYPES.OBJ) {
      delete props.item.children[child.id];
    } else if (childrenType === TYPES.ARR) {
      props.item.children = props.item.children.filter(
        (childItem) => childItem.id !== child.id
      );
    } else if (childrenType === TYPES.MAP) {
      props.item.children.delete(child.id);
    } else if (childrenType === TYPES.SET) {
      props.item.children.delete(child);
    }
  };

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <Box display="flex" alignItems="center">
          <Box flex={1} clone>
            <div
              style={{
                fontWeight: 700,
              }}
              onClick={() => {
                // Don't expand/collapse if there's nothing to expand/collapse
                if (props.item.children) {
                  if (props.expandedNodeIds.has(nodeId)) {
                    props.expandedNodeIds.delete(nodeId);
                  } else {
                    props.expandedNodeIds.add(nodeId);
                  }
                }
              }}
            >
              {props.item.name}
            </div>
          </Box>

          <Box component="span" pl={1} ml="auto">
            <ButtonGroup size="small" disabled={isSetItem}>
              {Object.entries(TYPES).map(([typeCode, typeString]) => (
                <Button
                  key={typeCode}
                  title={`Add ${typeString} child to node ${nodeId}`}
                  onClick={() => {
                    // If this wasn't expanded yet, expanded it now
                    if (!props.expandedNodeIds.has(nodeId)) {
                      props.expandedNodeIds.add(nodeId);
                    }
                    addChild(makeItem(childrenType, typeString));
                  }}
                >
                  + {typeCode}
                </Button>
              ))}
            </ButtonGroup>

            <Switch
              title={`Turn node ${nodeId} ${
                props.item.switchedOn ? 'off' : 'on'
              }`}
              disabled={isSetItem}
              checked={props.item.switchedOn}
              onChange={(e) => {
                props.item.switchedOn = e.target.checked;
              }}
            />

            <input
              value={props.item.notes}
              disabled={isSetItem}
              placeholder={
                isSetItem
                  ? `Can't modify items in a Set`
                  : `Notes for node ${nodeId}`
              }
              style={{
                border: `1px solid #ddd`,
                padding: 8,
              }}
              onChange={(e) => {
                props.item.notes = e.target.value;
              }}
              onClick={(e) => {
                // material-ui is stealing focus after the input is clicked.
                // This fix is extremely dodgy,
                // but for a test site it's good enough
                e.persist();
                setTimeout(() => {
                  e.target.focus();
                });
              }}
            />

            <IconButton
              disabled={!props.onDeleteChild}
              onClick={props.onDeleteChild}
              title={`Delete node ${nodeId}`}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      }
    >
      {props.item.children &&
        getChildrenAsArray(props.item.children).map((child) => (
          <Item
            key={child.id}
            item={child}
            expandedNodeIds={props.expandedNodeIds}
            onDeleteChild={() => deleteChild(child)}
          />
        ))}
    </TreeItem>
  );
};

Item.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    childrenType: PropTypes.oneOf(Object.values(TYPES)).isRequired,
    parentType: PropTypes.oneOf(Object.values(TYPES)).isRequired,
    children: PropTypes.any.isRequired,
    switchedOn: PropTypes.bool.isRequired,
    notes: PropTypes.string.isRequired,
  }).isRequired,
  onDeleteChild: PropTypes.func,
  expandedNodeIds: PropTypes.instanceOf(Set).isRequired,
};

export default Item;
