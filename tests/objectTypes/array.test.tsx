import React from 'react';
import { initStore, store as globalStore, WithStoreProp } from '../..';
import * as testUtils from '../testUtils';

let renderCount: number;
let taskNumber: number;
let taskId: number;
const log = jest.fn();

beforeEach(() => {
  initStore({
    tasks: [],
  });
  renderCount = 0;
  taskNumber = 1;
  taskId = -1;
  log.mockReset();
});

type Props = {
  task: testUtils.TaskType;
};

it('should operate on arrays', () => {
  const Task = (props: Props) => <div>{props.task.name}</div>;

  const { getByText, queryByText } = testUtils.collectAndRender(
    ({ store }: WithStoreProp) => {
      renderCount++;

      return (
        <div>
          <button
            onClick={() => {
              if (store.tasks) {
                store.tasks.push({
                  id: taskId--, // we go backwards with IDs so that .sort() triggers a change
                  name: `Task number ${taskNumber++}`,
                });

                log(store.tasks.length);
              }
            }}
          >
            Add task
          </button>

          <button
            onClick={() => {
              if (store.tasks) store.tasks.pop();
            }}
          >
            Remove last task
          </button>

          <button
            onClick={() => {
              delete store.tasks;
            }}
          >
            Remove all tasks
          </button>

          {!!store.tasks && !!store.tasks.length && (
            <>
              <h1>Task list</h1>

              {store.tasks.map((task) => (
                <Task task={task} key={task.id} />
              ))}
            </>
          )}
        </div>
      );
    }
  );

  expect(renderCount).toBe(1);

  expect(queryByText('Task list')).toBeNull();

  // should handle adding an item to an array
  getByText('Add task').click();

  expect(renderCount).toBe(2);
  expect(getByText('Task list'));
  expect(getByText('Task number 1'));
  // Reading immediately should already have the new length property
  expect(log).toHaveBeenCalledWith(1);
  expect(globalStore.tasks && globalStore.tasks.length).toBe(1);

  // should handle removing an item from an array
  getByText('Add task').click();
  getByText('Add task').click();
  expect(renderCount).toBe(4);

  expect(getByText('Task number 2'));
  expect(getByText('Task number 3'));

  getByText('Remove last task').click();
  expect(renderCount).toBe(5);

  expect(queryByText('Task number 3')).toBeNull();

  // should handle deleting an entire array
  expect(getByText('Task list'));

  getByText('Remove all tasks').click();
  expect(renderCount).toBe(6);

  expect(queryByText('Task list')).toBeNull();
});

it('should push then update', () => {
  globalStore.arr = [];
  globalStore.arr.push({ name: 'A two', done: false });
  globalStore.arr.unshift({ name: 'Task one', done: false });
  globalStore.arr[0].done = true;

  expect(globalStore.arr).toEqual([
    { name: 'Task one', done: true },
    { name: 'A two', done: false },
  ]);
});

/**
 * This tests that array mutator methods behave as expected, and that they
 * only re-render the component once each.
 */
it('should update once for array mutator methods', () => {
  globalStore.arr = [];
  type Props = {
    store: {
      arr: number[];
    };
  };

  renderCount = 0;

  const { getByText } = testUtils.collectAndRender(({ store }: Props) => {
    renderCount++;

    return <div>{`Array: ${store.arr?.join(', ') || 'none'}`}</div>;
  });

  expect(testUtils.getAllListeners()).toEqual(['arr']);

  getByText('Array: none');
  expect(renderCount).toBe(1);
  renderCount = 0;
  let result;

  const prevArray = globalStore.arr;
  globalStore.arr.push(22, 11, 33, 77, 44, 55, 66);

  // Confirm that the array is cloned
  expect(prevArray).not.toBe(globalStore.arr);

  getByText('Array: 22, 11, 33, 77, 44, 55, 66');
  expect(renderCount).toBe(1);

  renderCount = 0;
  result = globalStore.arr.sort();
  getByText('Array: 11, 22, 33, 44, 55, 66, 77');
  expect(result).toEqual([11, 22, 33, 44, 55, 66, 77]);
  expect(renderCount).toBe(1);

  renderCount = 0;
  result = globalStore.arr.sort((a: number, b: number) => b - a);
  getByText('Array: 77, 66, 55, 44, 33, 22, 11');
  expect(result).toEqual([77, 66, 55, 44, 33, 22, 11]);
  expect(renderCount).toBe(1);

  renderCount = 0;
  result = globalStore.arr.reverse();
  getByText('Array: 11, 22, 33, 44, 55, 66, 77');
  expect(result).toEqual([11, 22, 33, 44, 55, 66, 77]);
  expect(renderCount).toBe(1);

  renderCount = 0;
  result = globalStore.arr.pop();
  getByText('Array: 11, 22, 33, 44, 55, 66');
  expect(result).toBe(77);
  expect(renderCount).toBe(1);

  renderCount = 0;
  result = globalStore.arr.shift();
  getByText('Array: 22, 33, 44, 55, 66');
  expect(result).toBe(11);
  expect(renderCount).toBe(1);

  renderCount = 0;
  result = globalStore.arr.splice(0, 2);
  getByText('Array: 44, 55, 66');
  expect(result).toEqual([22, 33]);
  expect(renderCount).toBe(1);

  renderCount = 0;
  result = globalStore.arr.unshift(11, 22, 33);
  getByText('Array: 11, 22, 33, 44, 55, 66');
  expect(result).toBe(6);
  expect(renderCount).toBe(1);

  renderCount = 0;
  result = globalStore.arr.copyWithin(0, -3, -2);
  getByText('Array: 44, 22, 33, 44, 55, 66');
  expect(result).toEqual([44, 22, 33, 44, 55, 66]);
  expect(renderCount).toBe(1);

  // Here's an invalid copyWithin. It's fine that this updates
  renderCount = 0;
  result = globalStore.arr.copyWithin(0, 2, 2);
  getByText('Array: 44, 22, 33, 44, 55, 66');
  expect(result).toEqual([44, 22, 33, 44, 55, 66]);
  expect(renderCount).toBe(1);

  renderCount = 0;
  result = globalStore.arr.fill(11, 1, 3);
  getByText('Array: 44, 11, 11, 44, 55, 66');
  expect(result).toEqual([44, 11, 11, 44, 55, 66]);
  expect(renderCount).toBe(1);

  renderCount = 0;
  globalStore.arr.length = 0;
  getByText('Array: none');
  expect(result).toEqual([]);
  expect(renderCount).toBe(1);
});
