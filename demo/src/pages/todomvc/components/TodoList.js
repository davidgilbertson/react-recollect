import React from 'react';
import { collect } from 'react-recollect';
import getVisibleTodos from '../selectors/getVisibleTodos';
import TodoItem from './TodoItem';

const TodoList = () => (
  <ul className="todo-list">
    {getVisibleTodos().map((todo) => (
      <TodoItem key={todo.id} todo={todo} />
    ))}
  </ul>
);

export default collect(TodoList);
