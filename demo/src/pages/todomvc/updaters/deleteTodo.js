import { store } from 'react-recollect';

const deleteTodo = (id) => {
  store.todoMvcPage.todos = store.todoMvcPage.todos.filter(
    (todo) => todo.id !== id
  );
};

export default deleteTodo;
