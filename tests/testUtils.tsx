import React from 'react';
import { mocked } from 'ts-jest/utils';
import { render } from '@testing-library/react';
import { collect } from '../src';

// TODO (davidg): why can't I type this right?
export const collectAndRender = (Comp) => {
  const CollectedComp = collect(Comp);

  return render(<CollectedComp />);
};

export const propPathChanges = (handleChangeMock) =>
  handleChangeMock.mock.calls.map((call) => call[0].changedProps[0]);

export const expectToThrow = (func) => {
  // Even though the error is caught, it still gets printed to the console
  // so we mock that out to avoid the wall of red text.
  jest.spyOn(console, 'error');
  const mockedConsole = mocked(console.error, true);
  mockedConsole.mockImplementation(() => {});

  expect(func).toThrow();

  mockedConsole.mockRestore();
};

// Allow anything in the store for tests
declare module '../src' {
  interface Store {
    [key: string]: any;
  }
}
