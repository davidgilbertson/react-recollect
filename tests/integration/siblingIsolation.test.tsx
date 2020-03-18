import React from 'react';
import { render } from '@testing-library/react';
import { collect, store as globalStore, WithStoreProp } from '../../src';

let renderCountOne = 0;
let renderCountTwo = 0;
let renderCountThree = 0;

const One = ({ store }: WithStoreProp) => {
  renderCountOne++;
  return <div>{`This is ${store.areas.one.name}`}</div>;
};
const OneCollected = collect(One);

const Two = ({ store }: WithStoreProp) => {
  renderCountTwo++;
  return <div>{`This is ${store.areas.two.name}`}</div>;
};
const TwoCollected = collect(Two);

const Three = ({ store }: WithStoreProp) => {
  renderCountThree++;
  return <div>{`This is ${store.areas.three.name}`}</div>;
};
const ThreeCollected = collect(Three);

const Parent = () => (
  <div>
    <OneCollected />
    <TwoCollected />
    <ThreeCollected />
  </div>
);

globalStore.areas = {
  one: {
    name: 'Area one',
  },
  two: {
    name: 'Area two',
  },
  three: {
    name: 'Area three',
  },
};

it('should handle isolation', () => {
  const { getByText } = render(<Parent />);
  expect(renderCountOne).toBe(1);
  expect(renderCountTwo).toBe(1);
  expect(renderCountThree).toBe(1);

  // should render the title
  getByText('This is Area one');
  getByText('This is Area two');
  getByText('This is Area three');

  globalStore.areas.one.name = 'A new place';

  getByText('This is A new place');
  getByText('This is Area two');
  getByText('This is Area three');

  expect(renderCountOne).toBe(2);

  // These two won't update
  expect(renderCountTwo).toBe(1);
  expect(renderCountThree).toBe(1);
});
