import React from 'react';
import { mocked } from 'ts-jest/utils';
import { render } from '@testing-library/react';
import { collect, internals } from '..';
import { PROP_PATH_SEP } from '../src/shared/constants';

export const renderStrict = (children: React.ReactNode) => {
  return render(<React.StrictMode>{children}</React.StrictMode>);
};

export const collectAndRender = (Comp: React.ComponentType<any>) => {
  const CollectedComp = collect(Comp);

  return render(<CollectedComp />);
};

export const collectAndRenderStrict = (Comp: React.ComponentType<any>) => {
  const CollectedComp = collect(Comp);

  return renderStrict(<CollectedComp />);
};

export const propPathChanges = (handleChangeMock: jest.Mock) =>
  handleChangeMock.mock.calls.map((call) => call[0].changedProps[0]);

export const getAllListeners = () => {
  const matches = new RegExp(PROP_PATH_SEP, 'g');

  return Array.from(internals.listeners).map(([path]) =>
    path.replace(matches, '.')
  );
};

export const expectToLogError = (func: () => void, message?: string) => {
  // Even though the error is caught, it still gets printed to the console
  // so we mock that out to avoid the wall of red text.
  jest.spyOn(console, 'error');
  const mockedConsoleError = mocked(console.error, true);
  mockedConsoleError.mockImplementation(() => {});

  func();

  expect(mockedConsoleError).toHaveBeenCalled();

  if (message) expect(mockedConsoleError).toHaveBeenCalledWith(message);

  const consoleError = mockedConsoleError.mock.calls[0][0];
  mockedConsoleError.mockRestore();

  return consoleError;
};

export type TaskType = {
  id: number;
  name: string;
  done?: boolean;
};

declare module '..' {
  // Add a few things used in the tests
  interface Store {
    tasks?: TaskType[];
    // And anything else...
    [key: string]: any;
  }
}

// TODO: Delete me when this is merged:
//  https://github.com/DefinitelyTyped/DefinitelyTyped/pull/43102
declare module '@testing-library/dom' {
  export function waitFor(
    callback: () => void,
    options?: {
      container?: HTMLElement;
      timeout?: number;
      interval?: number;
      mutationObserverOptions?: MutationObserverInit;
    }
  ): Promise<void>;
}
