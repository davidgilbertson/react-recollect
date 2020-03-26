import React from 'react';
import { collect } from 'react-recollect';
import StorePropType from '../../../propTypes/StorePropType';
import TodoTextInput from './TodoTextInput';

const Header = ({ store }) => (
  <header className="header">
    <h1>todos</h1>

    <TodoTextInput
      newTodo
      onSave={(title) => {
        if (title.length) {
          store.todoMvcPage.todos.push({
            id: Math.random(),
            title,
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
