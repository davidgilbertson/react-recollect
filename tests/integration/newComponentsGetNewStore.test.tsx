import React from 'react';
import { collect, store as globalStore, WithStoreProp } from '../../src';
import * as testUtils from '../testUtils';

globalStore.hiddenMessage = '';

const TestChildComponent = collect(({ store }: WithStoreProp) => (
  <h1>{store.hiddenMessage}</h1>
));

const TestParentComponent = collect(({ store }: WithStoreProp) => (
  <div>
    {store.hiddenMessage ? <TestChildComponent /> : <p>Details are hidden</p>}
    <button
      onClick={() => {
        store.hiddenMessage = 'New hidden message';
      }}
    >
      Show detail
    </button>
  </div>
));

const { getByText } = testUtils.renderStrict(<TestParentComponent />);

it('should give the new version of the store to a newly mounting component', () => {
  getByText('Details are hidden');

  getByText('Show detail').click();

  getByText('New hidden message');
});
