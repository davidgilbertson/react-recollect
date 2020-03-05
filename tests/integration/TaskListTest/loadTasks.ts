import { store } from '../../../src';

const loadTasks = () => {
  setTimeout(() => {
    store.tasks = (store.tasks || []).concat([
      {
        id: 1,
        name: 'Task one',
        done: false,
      },
      {
        id: 2,
        name: 'Task two',
        done: false,
      },
      {
        id: 3,
        name: 'Task three',
        done: false,
      },
    ]);
  }, 200);
};

export default loadTasks;
