import { store } from 'react-recollect';
import { LOAD_STATUSES } from '../constants';

/** @return void */
const loadTodoData = async () => {
  store.todoMvcPage.loadStatus = LOAD_STATUSES.LOADING;

  const todos = await fetch(
    'https://jsonplaceholder.typicode.com/todos'
  ).then((response) => response.json());

  // Take the first 5 todos (there's 200)
  store.todoMvcPage.todos = todos.slice(0, 5);
  store.todoMvcPage.loadStatus = LOAD_STATUSES.LOADED;
};

export default loadTodoData;
