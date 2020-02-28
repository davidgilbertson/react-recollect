import React, { Component } from 'react';
import { collect } from '../../src';

class RawComponentWithStatic extends Component {
  static returnCats() {
    return 'cats';
  }

  static returnDogs: () => string;

  render() {
    return <h1>Hi</h1>;
  }
}

RawComponentWithStatic.returnDogs = () => 'dogs';

const ComponentWithStatic = collect(RawComponentWithStatic);

it('should copy static methods to the collected component', () => {
  // @ts-ignore
  expect(ComponentWithStatic.returnCats()).toBe('cats');
  // @ts-ignore
  expect(ComponentWithStatic.returnDogs()).toBe('dogs');
});
