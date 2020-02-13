import React, { Component } from 'react';
import { collect } from '../../dist';

class RawComponentWithStatic extends Component {
  static returnCats() {
    return 'cats';
  }

  render () {
    return <h1>Hi</h1>;
  }
}

RawComponentWithStatic.returnDogs = () => 'dogs';

const ComponentWithStatic = collect(RawComponentWithStatic);

it('should copy static methods to the collected component', () => {
  expect(ComponentWithStatic.returnCats()).toBe('cats');
  expect(ComponentWithStatic.returnDogs()).toBe('dogs');
});
