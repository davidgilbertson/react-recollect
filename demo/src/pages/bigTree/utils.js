import { TYPES } from '../todomvc/constants';

let id = 100;

export const makeItem = (type) => {
  id++;

  const item = {
    id,
    name: `${type} with id ${id}`,
    type,
    switchedOn: false,
    notes: '',
  };

  if (type === TYPES.OBJ) {
    item.children = {};
  } else if (type === TYPES.ARR) {
    item.children = [];
  } else if (type === TYPES.MAP) {
    item.children = new Map();
  } else if (type === TYPES.SET) {
    item.children = new Set();
  }

  return item;
};
