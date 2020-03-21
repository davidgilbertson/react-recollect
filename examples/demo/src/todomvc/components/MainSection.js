import React from 'react';
import { collect } from 'react-recollect';
import Footer from './Footer';
import TodoList from './TodoList';
import StorePropType from '../propTypes/StorePropType';

const MainSection = ({ store }) => {
  const completedCount = store.todos.filter((todo) => todo.completed).length;
  const todosCount = store.todos.length;

  return (
    <section className="main">
      {!!todosCount && (
        <span>
          <input
            className="toggle-all"
            type="checkbox"
            checked={completedCount === todosCount}
            readOnly
          />
          <label
            onClick={() => {
              store.todos.forEach((todo) => {
                todo.completed = true;
              });
            }}
          />
        </span>
      )}

      <TodoList />

      {!!todosCount && (
        <Footer
          completedCount={completedCount}
          activeCount={todosCount - completedCount}
          onClearCompleted={() => {
            store.todos = store.todos.filter(
              (todo) => todo.completed === false
            );
          }}
        />
      )}
    </section>
  );
};

MainSection.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(MainSection);
