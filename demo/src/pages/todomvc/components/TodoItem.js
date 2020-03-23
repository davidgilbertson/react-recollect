import classnames from 'classnames';
import React, { useState } from 'react';
import TodoPropType from '../propTypes/TodoPropType';
import deleteTodo from '../updaters/deleteTodo';
import TodoTextInput from './TodoTextInput';

const TodoItem = ({ todo }) => {
  const [editing, setEditing] = useState(false);

  const handleSave = (id, title) => {
    if (!title.length) {
      deleteTodo(id);
    } else {
      todo.title = title;
    }

    setEditing(false);
  };

  const inputId = `todo-complete-${todo.id}`;

  return (
    <li
      className={classnames({
        completed: todo.completed,
        editing,
      })}
    >
      {editing ? (
        <TodoTextInput
          title={todo.title}
          editing
          onSave={(title) => handleSave(todo.id, title)}
        />
      ) : (
        <div className="view">
          <input
            id={inputId}
            className="toggle"
            type="checkbox"
            checked={todo.completed}
            onChange={() => {
              todo.completed = !todo.completed;
            }}
          />

          <label
            htmlFor={inputId}
            onDoubleClick={() => {
              setEditing(true);
            }}
          >
            {todo.title}
          </label>

          <button
            className="destroy"
            onClick={() => deleteTodo(todo.id)}
            title={`Delete '${todo.title}'`}
          />
        </div>
      )}
    </li>
  );
};

TodoItem.propTypes = {
  todo: TodoPropType.isRequired,
};

export default React.memo(TodoItem);
