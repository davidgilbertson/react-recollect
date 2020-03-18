/**
 * To convert the path array to a string for the listener keys
 * Use a crazy separator. If the separator was a '.', and the user had a prop with a dot in it,
 * then it could cause false matches in the updated logic.
 */
export const PROP_PATH_SEP = '~~~';

export const PATH = Symbol('PATH');

export const ORIGINAL = Symbol('ORIGINAL');

/** Some of the map and set methods */
export const enum MapOrSetMembers {
  Get = 'get',
  Add = 'add',
  Clear = 'clear',
  Delete = 'delete',
  Set = 'set',
}

/** Some of the array methods, and length */
export const enum ArrayMembers {
  // Mutating methods
  CopyWithin = 'copyWithin',
  Fill = 'fill',
  Pop = 'pop',
  Push = 'push',
  Reverse = 'reverse',
  Shift = 'shift',
  Sort = 'sort',
  Splice = 'splice',
  Unshift = 'unshift',
  // Properties
  Length = 'length',
}
