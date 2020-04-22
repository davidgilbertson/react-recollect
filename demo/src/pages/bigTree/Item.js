import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import Switch from '@material-ui/core/Switch';
import { Delete } from '@material-ui/icons';
import TreeItem from '@material-ui/lab/TreeItem';
import React, { useRef } from 'react';
import { batch, PropTypes } from 'react-recollect';
import { TYPES } from '../../shared/constants';
import { getChildrenAsArray } from './selectors';
import { deleteChild } from './updaters';
import { makeItem } from './utils';

const Item = (props) => {
  const { item, parent } = props;

  // Items will re-render when the item updates or the parent item updates.
  const renderCountRef = useRef(0);
  renderCountRef.current++;

  const nodeId = item.id.toString();
  const isSetItem = item.parentType === TYPES.SET;

  const addChild = (newItem) => {
    if (item.childrenType === TYPES.OBJ) {
      item.children[newItem.id] = newItem;
    } else if (item.childrenType === TYPES.ARR) {
      item.children.push(newItem);
    } else if (item.childrenType === TYPES.MAP) {
      item.children.set(newItem.id, newItem);
    } else if (item.childrenType === TYPES.SET) {
      item.children.add(newItem);
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
                if (item.children) {
                  if (props.expandedNodeIds.has(nodeId)) {
                    props.expandedNodeIds.delete(nodeId);
                  } else {
                    props.expandedNodeIds.add(nodeId);
                  }
                }
              }}
            >
              {props.item.name} [{renderCountRef.current}]
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
                    batch(() => {
                      if (!props.expandedNodeIds.has(nodeId)) {
                        props.expandedNodeIds.add(nodeId);
                      }
                      addChild(makeItem(item.childrenType, typeString));
                    });
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
              onClick={() => props.onDeleteChild(parent, item)}
              title={`Delete node ${nodeId}`}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      }
    >
      {item.children &&
        getChildrenAsArray(item).map((child) => (
          <ItemMemo
            key={child.id}
            item={child}
            parent={item}
            expandedNodeIds={props.expandedNodeIds}
            onDeleteChild={deleteChild}
          />
        ))}
    </TreeItem>
  );
};

const ItemPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  childrenType: PropTypes.oneOf(Object.values(TYPES)).isRequired,
  parentType: PropTypes.oneOf(Object.values(TYPES)).isRequired,
  children: PropTypes.any.isRequired,
  switchedOn: PropTypes.bool.isRequired,
  notes: PropTypes.string.isRequired,
});

Item.propTypes = {
  item: ItemPropType.isRequired,
  parent: ItemPropType,
  onDeleteChild: PropTypes.func,
  expandedNodeIds: PropTypes.instanceOf(Set).isRequired,
};

const ItemMemo = React.memo(Item);

export default Item;
