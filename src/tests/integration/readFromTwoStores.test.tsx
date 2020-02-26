import React from 'react';
import { store as globalStore } from 'src';
import { collectAndRender, expectToThrow } from 'src/tests/testUtils';
import { WithStoreProp } from '../../../index.d';

it('should throw an error if I read from the wrong store', () => {
  globalStore.meta = { title: 'Hello' };

  expectToThrow(() => {
    collectAndRender(({ store }: WithStoreProp) => (
      <div>
        <p>{`${store.meta.title} from the store`}</p>
        <p>{`${globalStore.meta.title} from the globalStore`}</p>
      </div>
    ));
  });
});
