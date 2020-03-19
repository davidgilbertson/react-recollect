import React from 'react';
import PropTypes from 'prop-types';
import { initStore } from '../../src';
import * as testUtils from '../testUtils';

it('should not listen to props read from prop types', () => {
  initStore({
    prop1: 'This is prop1',
    prop2: 'This is prop2',
    prop3: 'This is prop3',
  });

  const MyComponent = ({ store }: any) => (
    <div>
      <p>{store.prop1}</p>
      <p>{store.prop2}</p>
    </div>
  );

  MyComponent.propTypes = {
    store: PropTypes.shape({
      prop1: PropTypes.string.isRequired,
      prop2: PropTypes.string.isRequired,
      prop3: PropTypes.string.isRequired,
    }).isRequired,
  };

  const { getByText } = testUtils.collectAndRender(MyComponent);

  expect(testUtils.getAllListeners()).toEqual([
    'prop1',
    'prop2',
    // Not prop3
  ]);

  getByText('This is prop1');
  getByText('This is prop2');
});

/**
 * This test asserts that Recollect doesn't break prop type checking
 */
it('should warn for failed prop types', () => {
  initStore();

  const MyComponent = ({ store }: any) => (
    <div>
      <p>{store.prop1}</p>
    </div>
  );

  MyComponent.propTypes = {
    store: PropTypes.shape({
      prop1: PropTypes.string.isRequired,
    }).isRequired,
  };

  const consoleError = testUtils.expectToLogError(() => {
    testUtils.collectAndRender(MyComponent);
  });

  expect(consoleError).toMatch(
    'The prop `store.prop1` is marked as required in `MyComponent`, but its value is `undefined`'
  );
});
