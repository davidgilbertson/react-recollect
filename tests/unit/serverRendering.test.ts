import { afterChange, store } from '../../src';
import state from '../../src/shared/state';

state.isInBrowser = false;

it('should handle not having window defined', () => {
  store.test = 'the value';

  expect(store.test).toEqual('the value');
});

it('should not react to setting data in the store when on the server', () => {
  const handleChange = jest.fn();
  afterChange(handleChange);

  store.title = 'any old title';
  expect(handleChange).toHaveBeenCalledTimes(0);
});
