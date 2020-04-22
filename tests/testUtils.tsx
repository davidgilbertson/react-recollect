import React from 'react';
import { mocked } from 'ts-jest/utils';
import { render } from '@testing-library/react';
import { collect, internals } from '..';
import * as paths from '../src/shared/paths';

export const renderStrict = (children: React.ReactNode) => {
  return render(<React.StrictMode>{children}</React.StrictMode>);
};

// Use collectAndRenderStrict instead of this if you don't need to count
// the number of renders
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

export const getAllListeners = () =>
  Array.from(internals.listeners.keys()).map(paths.internalToUser);

type ConsoleMethod = jest.FunctionPropertyNames<Required<typeof console>>;
type ConsoleMockFunc = {
  (func: () => void): string | string[];
};

/**
 * Run some code with the console mocked.
 */
const withMockedConsole = (
  func: () => void,
  method: ConsoleMethod
): string | string[] => {
  jest.spyOn(console, method);
  const mockedConsole = mocked(window.console[method], true);
  mockedConsole.mockImplementation(() => {});

  func();

  const consoleOutput =
    mockedConsole.mock.calls.length === 1
      ? mockedConsole.mock.calls[0][0]
      : mockedConsole.mock.calls.map((args: [string]) => args[0]);
  mockedConsole.mockRestore();

  return consoleOutput;
};

export const withMockedConsoleInfo: ConsoleMockFunc = (func) =>
  withMockedConsole(func, 'info');

export const withMockedConsoleWarn: ConsoleMockFunc = (func) =>
  withMockedConsole(func, 'warn');

export const expectToLogError: ConsoleMockFunc = (func) => {
  const consoleError = withMockedConsole(func, 'error');

  expect(consoleError).not.toBeUndefined();

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
