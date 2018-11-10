"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = exports.debugOff = exports.debugOn = void 0;
var DEBUG = localStorage.getItem('RECOLLECT__DEBUG') || 'off';

var debugOn = function debugOn() {
  DEBUG = 'on';
  localStorage.setItem('RECOLLECT__DEBUG', DEBUG);
};

exports.debugOn = debugOn;

var debugOff = function debugOff() {
  DEBUG = 'off';
  localStorage.setItem('RECOLLECT__DEBUG', DEBUG);
};

exports.debugOff = debugOff;
var log = new Proxy(console, {
  get: function get(target, prop) {
    // This means the line number for the log is where it was called, not here.
    if (DEBUG === 'on') return Reflect.get(target, prop);
    return function () {};
  }
});
exports.log = log;