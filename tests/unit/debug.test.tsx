import React from 'react';
import { initStore, collect, WithStoreProp } from '../..';
import * as testUtils from '../testUtils';

it('should do the right thing', () => {
  initStore({
    prop1: 'Prop 1',
    prop2: 'Prop 2',
    tasks: [
      {
        id: 0,
        name: 'Task 0',
      },
      {
        id: 1,
        name: 'Task 1',
      },
    ],
  });

  type TaskProps = WithStoreProp & {
    taskId: number;
  };

  const Task = ({ store, taskId }: TaskProps) => {
    if (!store.tasks) return null;

    const task = store.tasks.find(({ id }) => id === taskId);

    if (!task) return null;

    return (
      <div>
        <p>{store.prop2}</p>
        <p>{task.name}</p>
      </div>
    );
  };

  const TaskCollected = collect(Task);

  const TaskList = ({ store }: WithStoreProp) => (
    <div>
      <p>{store.prop1}</p>

      {store.tasks &&
        store.tasks.map((task) => (
          <TaskCollected key={task.id} taskId={task.id} />
        ))}
    </div>
  );

  testUtils.collectAndRenderStrict(TaskList);

  expect(window.__RR__.getListenersByComponent()).toEqual({
    Task: [
      'tasks',
      'tasks.0',
      'tasks.0.id',
      'tasks.1',
      'tasks.1.id',
      'prop2',
      'tasks.0.name',
      'tasks.1.name',
    ],
    TaskList: [
      'prop1',
      'tasks',
      'tasks.0',
      'tasks.0.id',
      'tasks.1',
      'tasks.1.id',
    ],
  });

  // Filter for the task list only
  expect(window.__RR__.getListenersByComponent(/TaskList/)).toEqual({
    TaskList: [
      'prop1',
      'tasks',
      'tasks.0',
      'tasks.0.id',
      'tasks.1',
      'tasks.1.id',
    ],
  });

  // Put the ID in the key and filter for a specific instance
  expect(
    window.__RR__.getListenersByComponent(
      'Task0',
      (props: TaskProps) => props.taskId
    )
  ).toEqual({
    Task0: ['tasks', 'tasks.0', 'tasks.0.id', 'prop2', 'tasks.0.name'],
  });

  expect(window.__RR__.getComponentsByListener()).toEqual({
    tasks: ['TaskList', 'Task'],
    'tasks.0': ['TaskList', 'Task'],
    'tasks.0.id': ['TaskList', 'Task'],
    'tasks.1': ['TaskList', 'Task'],
    'tasks.1.id': ['TaskList', 'Task'],
    prop2: ['Task'],
    'tasks.0.name': ['Task'],
    'tasks.1.name': ['Task'],
    prop1: ['TaskList'],
  });

  // Which components _instances_ listen to `tasks.0.id`?
  // Note that Task1 listens too because it loops over all tasks
  expect(
    window.__RR__.getComponentsByListener(
      'tasks.0.id',
      (props: TaskProps) => props.taskId
    )['tasks.0.id']
  ).toEqual(['TaskList', 'Task0', 'Task1']);

  expect(
    window.__RR__.getComponentsByListener(
      null,
      (props: TaskProps) => props.taskId
    )
  ).toEqual({
    tasks: ['TaskList', 'Task0', 'Task1'],
    'tasks.0': ['TaskList', 'Task0', 'Task1'],
    'tasks.0.id': ['TaskList', 'Task0', 'Task1'],
    'tasks.1': ['TaskList', 'Task1'],
    'tasks.1.id': ['TaskList', 'Task1'],
    prop2: ['Task0', 'Task1'],
    'tasks.0.name': ['Task0'],
    'tasks.1.name': ['Task1'],
    prop1: ['TaskList'],
  });
});
