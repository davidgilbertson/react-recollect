import React from 'react';
import { render } from 'react-testing-library';
import { collect, store as globalStore } from '../../dist';

globalStore.hiddenMessage = '';

const TestChildComponent = collect(({ store }) => (
  <h1>{store.hiddenMessage}</h1>
));

const TestParentComponent = collect(({ store }) => (
  <div>
    {!!store.hiddenMessage ? (
      <TestChildComponent />
    ) : (
      <p>Details are hidden</p>
    )}
    <button
      onClick={() => {
        store.hiddenMessage = 'New hidden message';
      }}
    >
      Show detail
    </button>
  </div>
));

const { getByText } = render(<TestParentComponent />);

it('should give the new version of the store to a newly mounting component', () => {
  getByText('Details are hidden');

  getByText('Show detail').click();

  getByText('New hidden message');
});
