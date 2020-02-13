import React from 'react';
import { render } from '@testing-library/react';
import { collect, store } from '../../dist';

const BasicComponent = collect((props) => (
  <h1>{props.store.title}</h1>
));

it('should render the title', () => {
  store.title = 'The initial title';

  const { getByText } = render(<BasicComponent />);

  getByText('The initial title');

  store.title = 'The updated title';

  getByText('The updated title');
});
