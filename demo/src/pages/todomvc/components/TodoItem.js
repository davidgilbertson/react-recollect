import React, { useState } from 'react';
import classnames from 'classnames';
import TodoTextInput from './TodoTextInput';
import deleteTodo from '../updaters/deleteTodo';
import TodoPropType from '../propTypes/TodoPropType';

const TodoItem = React.memo(({ todo }) => {
  const [editing, setEditing] = useState(false);

  const handleSave = (id, text) => {
    if (!text.length) {
      deleteTodo(id);
    } else {
      todo.text = text;
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
          text={todo.text}
          editing
          onSave={(text) => handleSave(todo.id, text)}
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
            {todo.text}
          </label>

          <button
            className="destroy"
            onClick={() => deleteTodo(todo.id)}
            title={`Delete '${todo.text}'`}
          />
        </div>
      )}
    </li>
  );
});

TodoItem.propTypes = {
  todo: TodoPropType.isRequired,
};

export default TodoItem;
