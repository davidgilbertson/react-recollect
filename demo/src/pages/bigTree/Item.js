import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import { Delete } from '@material-ui/icons';
import TreeItem from '@material-ui/lab/TreeItem';
import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { TYPES } from '../todomvc/constants';
import { makeItem } from './utils';

const getType = (item) =>
  Object.prototype.toString.call(item).replace('[object ', '').replace(']', '');

const Item = (props) => {
  const renderCount = useRef(0);
  renderCount.current++;
  const childrenType = getType(props.item.children);

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

  return (
    <TreeItem
      nodeId={props.item.id.toString()}
      label={
        <Box display="flex" alignItems="center">
          <strong>{props.item.name}</strong>

          <Box component="span" pl={1} ml="auto">
            <ButtonGroup size="small">
              {Object.entries(TYPES).map(([typeCode, typeString]) => (
                <Button
                  key={typeCode}
                  onClick={(e) => {
                    e.stopPropagation();
                    addChild(makeItem(typeString));
                  }}
                >
                  + {typeCode}
                </Button>
              ))}
            </ButtonGroup>

            {childrenType !== TYPES.SET && (
              <Switch
                checked={props.item.switchedOn}
                onChange={(e) => {
                  props.item.switchedOn = e.target.checked;
                }}
              />
            )}

            <TextField
              size="small"
              value={props.item.notes}
              onChange={(e) => {
                props.item.notes = e.target.value;
              }}
            />

            {!!props.onDeleteChild && (
              <IconButton onClick={props.onDeleteChild}>
                <Delete fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      }
    >
      {props.item.children &&
        getChildrenAsArray(props.item.children).map((child) => (
          <Item
            key={child.id}
            item={child}
            onDeleteChild={() => {
              if (childrenType === TYPES.OBJ) {
                delete props.item.children[child.id];
              } else if (childrenType === TYPES.ARR) {
                props.item.children = props.item.children.filter(
                  (childItem) => childItem.id !== child.id
                );
              } else if (childrenType === TYPES.MAP) {
                props.item.children.delete(child.id);
              } else if (childrenType === TYPES.SET) {
                props.item.children.delete(child.id);
              }
            }}
          />
        ))}
    </TreeItem>
  );
};

Item.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    children: PropTypes.any.isRequired,
    switchedOn: PropTypes.bool.isRequired,
    notes: PropTypes.string.isRequired,
  }).isRequired,
  onDeleteChild: PropTypes.func,
};

export default Item;
