"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SEP = exports.PATH_PROP = void 0;
// TODO (davidg): This risks collisions if a user's property name contains whatever
// my separator string is.
var PATH_PROP = Symbol('path'); // TODO (davidg): symbols mean I can't define the path as a string easily

exports.PATH_PROP = PATH_PROP;
var SEP = '.';
exports.SEP = SEP;