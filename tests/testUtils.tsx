import React from 'react';
import { mocked } from 'ts-jest/utils';
import { render } from '@testing-library/react';
import { collect } from '../src';
import state from '../src/shared/state';
import { PROP_PATH_SEP } from '../src/shared/constants';

export const collectAndRender = (Comp: React.ComponentType<any>) => {
  const CollectedComp = collect(Comp);

  return render(<CollectedComp />);
};

export const propPathChanges = (handleChangeMock: jest.Mock) =>
  handleChangeMock.mock.calls.map((call) => call[0].changedProps[0]);

export const getAllListeners = () => {
  const matches = new RegExp(PROP_PATH_SEP, 'g');

  return Array.from(state.listeners).map(([path]) =>
    path.replace(matches, '.')
  );
};

export const expectToLogError = (func: () => void) => {
  // Even though the error is caught, it still gets printed to the console
  // so we mock that out to avoid the wall of red text.
  jest.spyOn(console, 'error');
  const mockedConsoleError = mocked(console.error, true);
  mockedConsoleError.mockImplementation(() => {});

  func();

  expect(mockedConsoleError).toHaveBeenCalled();

  mockedConsoleError.mockRestore();
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
