import React from 'react';
import { render } from '@testing-library/react';
import { collect } from 'src';

export const collectAndRender = Comp => {
  const CollectedComp = collect(Comp);

  return render(<CollectedComp />);
};

export const propPathChanges = handleChangeMock =>
  handleChangeMock.mock.calls.map(call => call[0].changedProps[0]);
