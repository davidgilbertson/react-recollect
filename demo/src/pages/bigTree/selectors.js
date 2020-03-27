import { TYPES } from '../todomvc/constants';

export const getChildrenAsArray = (item) => {
  if (item.childrenType === TYPES.OBJ) {
    return Array.from(Object.values(item.children));
  }
  if (item.childrenType === TYPES.ARR) {
    return item.children;
  }
  if (item.childrenType === TYPES.MAP) {
    return Array.from(item.children.values());
  }
  if (item.childrenType === TYPES.SET) {
    return Array.from(item.children);
  }

  throw Error('Unknown type');
};
