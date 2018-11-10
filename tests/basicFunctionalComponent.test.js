import React from 'react';
import { render } from 'react-testing-library';
import { collect, store } from '../dist';

const BasicComponent = collect(() => (
  <h1>{store.title}</h1>
));

it('should render the title', () => {
  store.title = 'The initial title';

  const { getByText } = render(<BasicComponent />);

  expect(getByText('The initial title'));

  store.title = 'The updated title';

  expect(getByText('The updated title'));
});
