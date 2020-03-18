/**
 * To convert the path array to a string for the listener keys
 * Use a crazy separator. If the separator was a '.', and the user had a prop with a dot in it,
 * then it could cause false matches in the updated logic.
 */
export const PROP_PATH_SEP = '~~~';

export const PATH = Symbol('PATH');

export const ORIGINAL = Symbol('ORIGINAL');

export const enum MapOrSetMembers {
  // Read methods
  Entries = 'entries',
  ForEach = 'forEach',
  Get = 'get',
  Has = 'has',
  Keys = 'keys',
  Values = 'values',
  // Mutating methods
  Add = 'add',
  Clear = 'clear',
  Delete = 'delete',
  Set = 'set',
  // Properties
  Size = 'size',
}

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
