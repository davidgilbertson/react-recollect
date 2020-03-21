import { store } from 'react-recollect';

const deleteTodo = (id) => {
  store.todos = store.todos.filter((todo) => todo.id !== id);
};

export default deleteTodo;
