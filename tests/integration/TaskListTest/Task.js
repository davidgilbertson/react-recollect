import React from 'react';
import { store } from '../../../dist';

const Task = ({ task }) => (
  <div>
    <label>
      <input
        type="checkbox"
        checked={task.done}
        onChange={e => {
          task.done = e.target.checked;
        }}
      />
      {task.name}
    </label>

    <button onClick={() => {
      store.tasks = store.tasks.filter(storeTask => storeTask.id !== task.id);
    }}>
      Delete {task.name}
    </button>
  </div>
);

export default Task;
