import React from 'react';
import { store } from '../../../src';
import { TaskType } from '../../testUtils';

type Props = {
  task: TaskType;
};

const Task = React.memo(({ task }: Props) => (
  <div>
    <label>
      <input
        type="checkbox"
        checked={task.done}
        onChange={(e) => {
          // eslint-disable-next-line no-param-reassign
          task.done = e.target.checked;
        }}
      />
      {task.name}
    </label>

    <button
      onClick={() => {
        if (store.tasks) {
          store.tasks = store.tasks.filter(
            (storeTask: TaskType) => storeTask.id !== task.id
          );
        }
      }}
    >
      Delete {task.name}
    </button>
  </div>
));

export default Task;
