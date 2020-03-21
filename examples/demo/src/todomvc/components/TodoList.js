import React from 'react';
import { collect } from 'react-recollect';
import TodoItem from './TodoItem';
import getVisibleTodos from '../selectors/getVisibleTodos';

const TodoList = () => (
  <ul className="todo-list">
    {getVisibleTodos().map((todo) => (
      <TodoItem key={todo.id} todo={todo} />
    ))}
  </ul>
);

export default collect(TodoList);
