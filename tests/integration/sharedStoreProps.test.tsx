import React from 'react';
import { initStore, collect, WithStoreProp } from '../..';
import * as testUtils from '../testUtils';

beforeEach(() => {
  initStore();
});

/**
 * Passing anything from the store into a collected component can be trouble.
 * @see https://github.com/davidgilbertson/react-recollect/issues/102
 */
it('should error when sharing between collected components', () => {
  initStore({
    tasks: [
      {
        id: 1,
        name: 'Task one',
      },
    ],
  });

  const ChildComponent = ({ task }: any) => <div>{task.name}</div>;
  const ChildComponentCollected = collect(ChildComponent);

  // Shouldn't matter how many levels deep the prop is passed
  const MiddleComponent = ({ task }: any) => (
    <div>
      <ChildComponentCollected task={task} />
    </div>
  );

  const ParentComponent = collect(({ store }: WithStoreProp) => (
    <div>
      {!!store.tasks &&
        store.tasks.map((task) => (
          <MiddleComponent key={task.id} task={task} />
        ))}
    </div>
  ));

  const errorMessage = testUtils.expectToLogError(() => {
    testUtils.renderStrict(<ParentComponent />);
  });

  // Just a partial match...
  expect(errorMessage).toMatch(
    'Either remove the collect() wrapper from <ChildComponent/>, or remove the "task" prop'
  );
});
