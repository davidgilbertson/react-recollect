import { TYPES } from '../../shared/constants';

let id = 99;

export const makeItem = (parentType, childrenType) => {
  id++;

  const item = {
    id,
    name: null,
    childrenType,
    parentType,
    switchedOn: false,
    notes: '',
  };

  if (parentType === TYPES.OBJ) {
    item.name = `An object prop with ${childrenType} children (${id})`;
  } else if (parentType === TYPES.ARR) {
    item.name = `An array item with ${childrenType} children (${id})`;
  } else if (parentType === TYPES.MAP) {
    item.name = `A Map entry with ${childrenType} children (${id})`;
  } else if (parentType === TYPES.SET) {
    item.name = `A Set entry with ${childrenType} children (${id})`;
  }

  if (childrenType === TYPES.OBJ) {
    item.children = {};
  } else if (childrenType === TYPES.ARR) {
    item.children = [];
  } else if (childrenType === TYPES.MAP) {
    item.children = new Map();
  } else if (childrenType === TYPES.SET) {
    item.children = new Set();
  }

  return item;
};

export const stringifyPlus = (data) =>
  JSON.stringify(
    data,
    (key, value) => {
      if (value instanceof Map) {
        return {
          '<Map>': Array.from(value),
        };
      }

      if (value instanceof Set) {
        return {
          '<Set>': Array.from(value),
        };
      }

      return value;
    },
    2
  );
