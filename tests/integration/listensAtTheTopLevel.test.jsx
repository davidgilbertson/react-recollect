import React from 'react';
import { store as globalStore } from 'src';
import { collectAndRender } from 'tests/testUtils';

it('should register a listener on the store object itself', () => {
  const { getByText } = collectAndRender(({ store }) => (
    <div>
      {Object.keys(store).length ? (
        <div>The store has stuff in it</div>
      ) : (
        <div>The store is empty</div>
      )}
    </div>
  ));

  getByText('The store is empty');

  globalStore.anything = true;

  getByText('The store has stuff in it');
});

it('should register a listener on the store object itself', () => {
  const { getByText } = collectAndRender(({ store }) => (
    <div>
      {Object.values(store).includes('test') ? (
        <div>Has test</div>
      ) : (
        <div>Does not have test</div>
      )}
    </div>
  ));

  getByText('Does not have test');

  globalStore.anything = 'Not test';

  getByText('Does not have test');

  globalStore.anything = 'test';

  getByText('Has test');
});
