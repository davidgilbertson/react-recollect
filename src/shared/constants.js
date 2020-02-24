/**
 * To convert the path array to a string for the listener keys
 * Use a crazy separator. If the separator was a '.', and the user had a prop with a dot in it,
 * then it could cause false matches in the updated logic.
 * @type {string}
 */
// eslint-disable-next-line import/prefer-default-export
export const PROP_PATH_SEP = '~~~';

export const IS_OLD_STORE = Symbol('IS_OLD_STORE');
