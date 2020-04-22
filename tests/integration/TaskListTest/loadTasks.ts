import { store, batch } from '../../..';

const loadTasks = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      batch(() => {
        if (!store.tasks) store.tasks = [];

        store.tasks.push(
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
          }
        );
      });

      resolve();
    }, 100);
  });

export default loadTasks;
