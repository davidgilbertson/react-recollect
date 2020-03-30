import { store } from 'react-recollect';
import { VISIBILITY_FILTERS } from '../constants';

const getVisibleTodos = () => {
  const { todos, visibilityFilter } = store.todoMvcPage;

  if (visibilityFilter === VISIBILITY_FILTERS.SHOW_ALL) {
    return todos;
  }

  if (visibilityFilter === VISIBILITY_FILTERS.SHOW_COMPLETED) {
    return todos.filter((todo) => todo.completed);
  }

  if (visibilityFilter === VISIBILITY_FILTERS.SHOW_ACTIVE) {
    return todos.filter((todo) => !todo.completed);
  }

  throw new Error(`Unknown filter: ${visibilityFilter}`);
};

export default getVisibleTodos;
