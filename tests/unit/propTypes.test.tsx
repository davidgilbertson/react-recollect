// @ts-nocheck
import React from 'react';
import { PropTypes, initStore } from '../..';
import * as testUtils from '../testUtils';

it('should identify prop type mismatch for function components', () => {
  const MyComponent = (props) => {
    return <h1>{props.prop1}</h1>;
  };

  MyComponent.propTypes = {
    prop1: PropTypes.number.isRequired,
  };

  const errorMessage = testUtils.expectToLogError(() => {
    testUtils.renderStrict(<MyComponent prop1="a string" />);
  });

  expect(errorMessage).toMatch(
    'Warning: Failed prop type: Invalid prop `prop1` of type `string` supplied to `MyComponent`, expected `number`.'
  );
});

it('should identify missing prop type for function components', () => {
  const MyFunctionComponent = (props) => {
    return <h1>{props.prop1}</h1>;
  };

  MyFunctionComponent.propTypes = {
    prop1: PropTypes.string.isRequired,
    // eslint-disable-next-line react/no-unused-prop-types
    prop2: PropTypes.number.isRequired,
  };

  const errorMessage = testUtils.expectToLogError(() => {
    testUtils.renderStrict(<MyFunctionComponent prop1="a string" />);
  });

  expect(errorMessage).toMatch(
    'Warning: Failed prop type: The prop `prop2` is marked as required in `MyFunctionComponent`, but its value is `undefined`'
  );
});

it('should identify prop type errors for classes', () => {
  // eslint-disable-next-line react/prefer-stateless-function
  class MyClassComponent extends React.Component {
    static propTypes = {
      prop1: PropTypes.number.isRequired,
    };

    render() {
      return <h1>{this.props.prop1}</h1>;
    }
  }

  const errorMessage = testUtils.expectToLogError(() => {
    const { getByText } = testUtils.renderStrict(
      <MyClassComponent prop1="a string" />
    );

    // This should log an error, but still render correctly.
    getByText('a string');
  });

  expect(errorMessage).toMatch(
    'Warning: Failed prop type: Invalid prop `prop1` of type `string` supplied to `MyClassComponent`, expected `number`.'
  );
});

it('should pass all valid prop types', () => {
  // This is really testing the implementation of the `prop-types` library,
  // but since it's quite conceivable that wrapping it in a proxy could break
  // it, we do it anyway.
  const MyComponent = (props) => {
    return <h2>{props.store.readByChild}</h2>;
  };

  const MyOtherComponent = () => <p>Foo</p>;

  const MyCollectedComponent = (props) => {
    return (
      <div>
        <h1>{props.store.readByParent}</h1>
        <MyComponent {...props} />
      </div>
    );
  };

  initStore({
    readByParent: 'Read By Parent',
    readByChild: 'Read By Child',
    testAny: 'Any',
    testArray: ['array'],
    testBool: true,
    testFunc: () => {},
    testNumber: 77,
    testObject: { foo: 'bar' },
    testString: 'string',
    testNode: <h1>Hello</h1>,
    testElement: <h1>Hello</h1>,
    testSymbol: Symbol('foo'),
    testElementType: MyOtherComponent,
    testInstanceOfMap: new Map([['foo', 'bar']]),
    testOneOf: 'foo',
    testOneOfType: ['an array'],
    testArrayOf: [1, 2, 3],
    testObjectOf: { foo: 1234 },
    testShape: {
      fooShape: 'bar',
      bazShape: 'Luhrmann',
      extra: 'fine',
    },
    testExact: {
      fooExact: 'bar',
      bazExact: 'Luhrmann',
    },
  });

  /* eslint-disable */
  MyComponent.propTypes = {
    store: PropTypes.shape({
      readByParent: PropTypes.string.isRequired,
      readByChild: PropTypes.string.isRequired,

      // One for each prop type
      testAny: PropTypes.any.isRequired,
      testAny: PropTypes.any.isRequired,
      testArray: PropTypes.array.isRequired,
      testBool: PropTypes.bool.isRequired,
      testFunc: PropTypes.func.isRequired,
      testNumber: PropTypes.number.isRequired,
      testObject: PropTypes.object.isRequired,
      testString: PropTypes.string.isRequired,
      testNode: PropTypes.node.isRequired,
      testElement: PropTypes.element.isRequired,
      testSymbol: PropTypes.symbol.isRequired,
      testElementType: PropTypes.elementType.isRequired,
      testInstanceOfMap: PropTypes.instanceOf(Map).isRequired,
      testOneOf: PropTypes.oneOf(['foo']).isRequired,
      testOneOfType: PropTypes.oneOfType([PropTypes.array]).isRequired,
      testArrayOf: PropTypes.arrayOf(PropTypes.number).isRequired,
      testObjectOf: PropTypes.objectOf(PropTypes.number).isRequired,
      testShape: PropTypes.shape({
        fooShape: PropTypes.string.isRequired,
        bazShape: PropTypes.string.isRequired,
      }).isRequired,
      testExact: PropTypes.exact({
        fooExact: PropTypes.string.isRequired,
        bazExact: PropTypes.string.isRequired,
      }).isRequired,
    }),
  };
  /* eslint-enable */

  const { getByText } = testUtils.collectAndRenderStrict(MyCollectedComponent);
  getByText('Read By Parent');
  getByText('Read By Child');

  expect(testUtils.getAllListeners()).toEqual(['readByParent', 'readByChild']);
});
