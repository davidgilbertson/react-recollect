import { store, initStore } from '../..';

beforeEach(() => {
  initStore();
});

const getType = (item: any) =>
  Object.prototype.toString
    .call(item)
    .replace('[object ', '')
    .replace(']', '');

it('should should have the correct type', () => {
  store.array = [];
  store.date = new Date();
  store.boolean = false;
  store.map = new Map();
  store.null = null;
  store.number = 77;
  store.object = {};
  store.regExp = /cats/;
  store.set = new Set();
  store.string = 'string';

  expect(typeof store.array).toBe('object');
  expect(typeof store.date).toBe('object');
  expect(typeof store.boolean).toBe('boolean');
  expect(typeof store.map).toBe('object');
  expect(typeof store.null).toBe('object');
  expect(typeof store.number).toBe('number');
  expect(typeof store.object).toBe('object');
  expect(typeof store.regExp).toBe('object');
  expect(typeof store.set).toBe('object');
  expect(typeof store.string).toBe('string');

  expect(getType(store.array)).toBe('Array');
  expect(getType(store.date)).toBe('Date');
  expect(getType(store.boolean)).toBe('Boolean');
  expect(getType(store.map)).toBe('Map');
  expect(getType(store.null)).toBe('Null');
  expect(getType(store.number)).toBe('Number');
  expect(getType(store.object)).toBe('Object');
  expect(getType(store.regExp)).toBe('RegExp');
  expect(getType(store.set)).toBe('Set');
  expect(getType(store.string)).toBe('String');

  expect(Array.isArray(store.array)).toBe(true);

  expect(store.map instanceof Map).toBe(true);
  expect(store.set instanceof Set).toBe(true);
});

it('should should have typeof undefined', () => {
  expect(store.foo).toBeUndefined();
  expect(typeof store.foo).toBe('undefined');

  store.foo = 'bar';
  expect(typeof store.foo).not.toBe('undefined');

  delete store.foo;
  expect(typeof store.foo).toBe('undefined');
});
