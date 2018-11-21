import React, { Component } from 'react';
import { render } from 'react-testing-library';
import { collect } from '../../dist/index';

const RawCleverInput = (props) => (
  <label>
    The input
    <input ref={props.forwardedRef} defaultValue={props.defaultValue} />
  </label>
);

const CleverInput = collect(RawCleverInput, { forwardRef: true });

class RawComponentWithRef extends Component {
  constructor(props) {
    super(props);

    this.inputRef = React.createRef();
  }

  render () {
    return (
      <div>
        <button
          onClick={() => {
            this.inputRef.current.value = 'X';
          }}
        >
          Empty the input
        </button>

        <CleverInput defaultValue='some text' ref={this.inputRef}/>
      </div>
    );
  }
}

const ComponentWithRef = collect(RawComponentWithRef);

const { getByText, getByLabelText } = render(<ComponentWithRef />);

it('should empty the input when the button is clicked', () => {
  expect(getByLabelText('The input').value).toBe('some text');
  getByLabelText('The input').value = 'some different text';
  expect(getByLabelText('The input').value).toBe('some different text');

  getByText('Empty the input').click();

  expect(getByLabelText('The input').value).toBe('X');
});
