import React from 'react';
import { store as globalStore, WithStoreProp } from '../../src';
import { collectAndRender, expectToLogError } from '../testUtils';

it('should throw an error if I read from the wrong store', () => {
  globalStore.meta = { title: 'Hello' };

  expectToLogError(() => {
    collectAndRender(({ store }: WithStoreProp) => (
      <div>
        <p>{`${store.meta.title} from the store`}</p>
        <p>{`${globalStore.meta.title} from the globalStore`}</p>
      </div>
    ));
  });
});
