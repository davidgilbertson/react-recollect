import { store } from 'react-recollect';

const deleteTodo = (id) => {
  store.todoMvc.todos = store.todoMvc.todos.filter((todo) => todo.id !== id);
};

export default deleteTodo;
