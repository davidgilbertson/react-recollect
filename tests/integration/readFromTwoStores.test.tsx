import React from 'react';
import { store as globalStore, WithStoreProp } from '../../src';
import { collectAndRender } from '../testUtils';

const getTitle = () => globalStore.meta.title;

it('should not matter which store I read/write from', () => {
  globalStore.meta = { title: 'Hello' };

  const { getByText } = collectAndRender(({ store }: WithStoreProp) => (
    <div>
      <p>{`${store.meta.title} from the store`}</p>
      <p>{`${globalStore.meta.title} from the globalStore`}</p>

      <button
        onClick={() => {
          store.meta.title += '1';
          globalStore.meta.title += '2';
          store.meta.title += '3';
          globalStore.meta.title = `${getTitle()}4`;
        }}
      >
        Change things
      </button>
    </div>
  ));

  getByText('Change things').click();

  getByText('Hello1234 from the store');
  getByText('Hello1234 from the globalStore');
});

it('should subscribe to changes from the global store', () => {
  globalStore.meta = { title: 'Hello' };

  // This is wrapped in `collect` but doesn't reference props at all
  const { getByText } = collectAndRender(() => (
    <div>
      <p>{`${globalStore.meta.title} from the globalStore`}</p>

      <button
        onClick={() => {
          globalStore.meta.title += '2';
          globalStore.meta.title = `${getTitle()}4`;
        }}
      >
        Change things
      </button>
    </div>
  ));

  getByText('Hello from the globalStore');

  getByText('Change things').click();

  getByText('Hello24 from the globalStore');
});
