import React from 'react';
import { collect } from 'react-recollect';
import TodoItem from './TodoItem';
import getVisibleTodos from '../selectors/getVisibleTodos';
import StorePropType from '../propTypes/StorePropType';

const TodoList = ({ store }) => (
  <ul className="todo-list">
    {getVisibleTodos(store).map((todo) => (
      <TodoItem key={todo.id} todo={todo} />
    ))}
  </ul>
);

TodoList.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(TodoList);
