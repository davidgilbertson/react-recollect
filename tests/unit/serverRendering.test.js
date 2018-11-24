import React from 'react';
import { afterChange, store } from '../../dist';

delete global.window;

it('should handle not having window defined', () => {
  expect(typeof window).toBe('undefined');

  store.tasks = [1, 2, 3];

  expect(store.tasks).toEqual([1, 2, 3]);
});

it('should not react to setting data in the store when on the server', () => {
  const handleChange = jest.fn();
  afterChange(handleChange);

  store.title = 'any old title';
  expect(handleChange).toHaveBeenCalledTimes(0);
});
