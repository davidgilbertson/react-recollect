import React from 'react';
import { initStore, store as globalStore, WithStoreProp } from '../../src';
import * as testUtils from '../testUtils';

beforeEach(() => {
  initStore();
});

it('should register the correct listeners', () => {
  initStore({
    data: {
      myObj: {
        name: 'string',
      },
      myArr: [
        {
          id: 1,
          name: 'string',
        },
        {
          id: 2,
          name: 'string',
        },
      ],
      myMap: new Map([
        [
          'one',
          {
            id: 1,
            name: 'string',
          },
        ],
        [
          'two',
          {
            id: 2,
            name: 'string',
          },
        ],
      ]),
      mySet: new Set(['one', 'two', 'three']),
    },
  });

  testUtils.collectAndRender(({ store }: WithStoreProp) => {
    return (
      <div>
        <h1>Object</h1>
        <p>{store.data.myObj.name}</p>

        <h1>Array</h1>
        <ul>
          {store.data.myArr.map((item: any) => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>

        <h1>Map</h1>
        <p>{store.data.myMap.get('one').name}</p>

        <h1>Set</h1>
        <p>{store.data.mySet.has('one')}</p>
      </div>
    );
  });

  expect(testUtils.getAllListeners()).toEqual([
    'data',
    'data.myObj',
    'data.myObj.name',
    'data.myArr',
    'data.myArr.0',
    'data.myArr.0.id',
    'data.myArr.0.name',
    'data.myArr.1',
    'data.myArr.1.id',
    'data.myArr.1.name',
    'data.myMap',
    'data.myMap.one',
    'data.myMap.one.name',
    'data.mySet',
    // All set changes trigger the whole set. So no `data.mySet.one`
  ]);
});

it('should register a listener on the store object itself', () => {
  const {
    getByText,
  } = testUtils.collectAndRender(({ store }: WithStoreProp) => (
    <div>
      {Object.keys(store).length ? (
        <div>The store has stuff in it</div>
      ) : (
        <div>The store is empty</div>
      )}
    </div>
  ));

  expect(testUtils.getAllListeners()).toEqual(['']);

  getByText('The store is empty');

  globalStore.anything = true;

  getByText('The store has stuff in it');
});

it('should register a listener on the store object with values()', () => {
  const {
    getByText,
  } = testUtils.collectAndRender(({ store }: WithStoreProp) => (
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

it('should register a listener on the store object with is', () => {
  const {
    getByText,
  } = testUtils.collectAndRender(({ store }: WithStoreProp) => (
    <div>
      {'anything' in store ? (
        <div>Has test</div>
      ) : (
        <div>Does not have test</div>
      )}
    </div>
  ));

  getByText('Does not have test');

  globalStore.nothing = 'Not a thing';

  getByText('Does not have test');

  globalStore.anything = 'Literally anything';

  getByText('Has test');
});
