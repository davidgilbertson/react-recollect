import React from 'react';
import { store } from '../../src';
import { collectAndRender } from '../testUtils';

it('should render the title', () => {
  store.title = 'The initial title';

  const { getByText } = collectAndRender((props) => (
    // @ts-ignore
    <h1>{props.store.title}</h1>
  ));

  getByText('The initial title');

  store.title = 'The updated title';

  getByText('The updated title');
});
