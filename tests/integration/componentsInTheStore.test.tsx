import React from 'react';
import { initStore, WithStoreProp } from '../..';
import * as testUtils from '../testUtils';

it('should store a component', () => {
  initStore({
    components: {
      Header: (props: any) => <h1>{props.title}</h1>,
    },
  });

  const { getByText } = testUtils.collectAndRenderStrict(
    ({ store }: WithStoreProp) => {
      const { Header } = store.components;

      return (
        <div>
          <Header title="Page one" />
        </div>
      );
    }
  );

  getByText('Page one');
});

it('will not store a component instance or element', () => {
  initStore({
    components: {
      header: <h1>I am a header</h1>,
    },
  });

  const consoleError = testUtils.expectToLogError(() => {
    testUtils.collectAndRenderStrict(({ store }: WithStoreProp) => (
      <div>{store.components.header}</div>
    ));
  });

  // I don't know why exactly, but it seems that React sets 'validated'
  expect(consoleError).toMatch(
    `You are attempting to modify the store during a render cycle. (You're setting "validated" to "true" somewhere)`
  );
});
