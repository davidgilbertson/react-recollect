/**
 * To convert the path array to a string for the listener keys
 * Use a crazy separator. If the separator was a '.', and the user had a prop with a dot in it,
 * then it could cause false matches in the updated logic.
 */
export const PROP_PATH_SEP = '~~~';

export const PATH = Symbol('PATH');

export const ORIGINAL = Symbol('ORIGINAL');
