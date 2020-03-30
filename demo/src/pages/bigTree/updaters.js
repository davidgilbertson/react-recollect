import { TYPES } from '../todomvc/constants';

export const deleteChild = (parent, child) => {
  if (parent.childrenType === TYPES.OBJ) {
    delete parent.children[child.id];
  } else if (parent.childrenType === TYPES.ARR) {
    parent.children = parent.children.filter(
      (childItem) => childItem.id !== child.id
    );
  } else if (parent.childrenType === TYPES.MAP) {
    parent.children.delete(child.id);
  } else if (parent.childrenType === TYPES.SET) {
    parent.children.delete(child);
  }
};
