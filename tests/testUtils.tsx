import React from 'react';
import { mocked } from 'ts-jest/utils';
import { render } from '@testing-library/react';
import { collect } from '../src';

export const collectAndRender = (Comp: React.ComponentType<any>) => {
  const CollectedComp = collect(Comp);

  return render(<CollectedComp />);
};

export const propPathChanges = (handleChangeMock: jest.Mock) =>
  handleChangeMock.mock.calls.map((call) => call[0].changedProps[0]);

export const expectToThrow = (func: () => void) => {
  // Even though the error is caught, it still gets printed to the console
  // so we mock that out to avoid the wall of red text.
  jest.spyOn(console, 'error');
  const mockedConsole = mocked(console.error, true);
  mockedConsole.mockImplementation(() => {});

  expect(func).toThrow();

  mockedConsole.mockRestore();
};

export type TaskType = {
  id: number;
  name: string;
  done?: boolean;
};

declare module '../src' {
  // Add a few things used in the tests
  interface Store {
    tasks?: TaskType[];
    // And anything else...
    [key: string]: any;
  }
}
