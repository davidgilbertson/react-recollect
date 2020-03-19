import React, { Component } from 'react';
import { collect, WithStoreProp } from '../../src';
import * as testUtils from '../testUtils';

type Props = WithStoreProp & {
  defaultValue: string;
  inputRef: React.Ref<HTMLInputElement>;
};

const CollectedWithRef = collect((props: Props) => (
  <label>
    The input
    <input ref={props.inputRef} defaultValue={props.defaultValue} />
  </label>
));

class ComponentWithRef extends Component {
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

        <CollectedWithRef defaultValue="some text" inputRef={this.inputRef} />
      </div>
    );
  }
}

const { getByText, getByLabelText } = testUtils.renderStrict(
  <ComponentWithRef />
);

const getInputByLabelText = (text: string) =>
  getByLabelText(text) as HTMLInputElement;

it('should empty the input when the button is clicked', () => {
  expect(getInputByLabelText('The input').value).toBe('some text');
  getInputByLabelText('The input').value = 'some different text';
  expect(getInputByLabelText('The input').value).toBe('some different text');

  getByText('Empty the input').click();

  expect(getInputByLabelText('The input').value).toBe('X');
});
