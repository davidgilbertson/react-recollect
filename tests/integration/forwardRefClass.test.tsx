/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import { render } from '@testing-library/react';
import { collect, WithStoreProp } from '../../src';

interface Props extends WithStoreProp {
  defaultValue: string;
  ref: React.Ref<HTMLInputElement>;
}

class RawCleverInput extends React.PureComponent<Props> {
  render() {
    const { props } = this;
    return (
      <label>
        The input
        <input ref={props.forwardedRef} defaultValue={props.defaultValue} />
      </label>
    );
  }
}

const CleverInput = collect(RawCleverInput, { forwardRef: true });

class RawComponentWithRef extends Component {
  inputRef = React.createRef<HTMLInputElement>();

  render() {
    return (
      <div>
        <button
          onClick={() => {
            if (this.inputRef.current) {
              this.inputRef.current.value = 'X';
            }
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

it('should empty the input when the button is clicked', () => {
  const getInputByLabelText = (text) =>
    getByLabelText(text) as HTMLInputElement;

  expect(getInputByLabelText('The input').value).toBe('some text');
  getInputByLabelText('The input').value = 'some different text';
  expect(getInputByLabelText('The input').value).toBe('some different text');

  getByText('Empty the input').click();

  expect(getInputByLabelText('The input').value).toBe('X');
});
