import React from 'react';
import { collect } from 'react-recollect';
import TodoTextInput from './TodoTextInput';
import StorePropType from '../../../propTypes/StorePropType';

const Header = ({ store }) => (
  <header className="header">
    <h1>todos</h1>

    <TodoTextInput
      newTodo
      onSave={(text) => {
        if (text.length) {
          store.todoMvc.todos.push({
            id: Math.random().toString().slice(2),
            text,
            completed: false,
          });
        }
      }}
      placeholder="What needs to be done?"
    />
  </header>
);

Header.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(Header);
