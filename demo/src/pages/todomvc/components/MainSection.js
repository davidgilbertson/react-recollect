import React from 'react';
import { collect } from 'react-recollect';
import StorePropType from '../../../propTypes/StorePropType';
import Footer from './Footer';
import TodoList from './TodoList';

const MainSection = ({ store }) => {
  const completedCount = store.todoMvcPage.todos.filter(
    (todo) => todo.completed
  ).length;
  const todosCount = store.todoMvcPage.todos.length;

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
            data-testid="toggle-all"
            onClick={() => {
              // If not everything is complete, mark everything complete; else
              // mark everything incomplete
              const completedForAll = completedCount !== todosCount;

              store.todoMvcPage.todos.forEach((todo) => {
                todo.completed = completedForAll;
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
            store.todoMvcPage.todos = store.todoMvcPage.todos.filter(
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
