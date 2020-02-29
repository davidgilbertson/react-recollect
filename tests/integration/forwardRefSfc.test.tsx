import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { collect, WithStoreProp } from '../../src';

interface Props extends WithStoreProp {
  defaultValue: string;
  ref: any;
}

const RawCleverInput: React.FC<Props> = (props) => (
  <label>
    The input
    <input ref={props.forwardedRef} defaultValue={props.defaultValue} />
  </label>
);

const CleverInput = collect(RawCleverInput, { forwardRef: true });

class RawComponentWithRef extends Component {
  inputRef = React.createRef<HTMLInputElement>();

  render() {
    return (
      <div>
        <button
          onClick={() => {
            this.inputRef.current!.value = 'X';
          }}
        >
          Empty the input
        </button>

        <CleverInput defaultValue="some text" ref={this.inputRef} />
      </div>
    );
  }
}

const ComponentWithRef = collect(RawComponentWithRef);

const { getByText, getByLabelText } = render(<ComponentWithRef />);

const getInputByLabelText = (text: string) =>
  getByLabelText(text) as HTMLInputElement;

it('should empty the input when the button is clicked', () => {
  expect(getInputByLabelText('The input').value).toBe('some text');
  getInputByLabelText('The input').value = 'some different text';
  expect(getInputByLabelText('The input').value).toBe('some different text');

  getByText('Empty the input').click();

  expect(getInputByLabelText('The input').value).toBe('X');
});
