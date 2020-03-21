import React from 'react';
import { collect } from 'react-recollect';
import Footer from './Footer';
import TodoList from './TodoList';
import StorePropType from '../../propTypes/StorePropType';

const MainSection = ({ store }) => {
  const completedCount = store.todoMvc.todos.filter((todo) => todo.completed)
    .length;
  const todosCount = store.todoMvc.todos.length;

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
              // If not everything is complete, mark everything complete; else
              // mark everything incomplete
              const completedForAll = completedCount !== todosCount;

              store.todoMvc.todos.forEach((todo) => {
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
            store.todoMvc.todos = store.todoMvc.todos.filter(
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
