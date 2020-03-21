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
            className="toggle"
            type="checkbox"
            checked={todo.completed}
            onChange={() => {
              todo.completed = !todo.completed;
            }}
          />

          <label
            onDoubleClick={() => {
              setEditing(true);
            }}
          >
            {todo.text}
          </label>

          <button className="destroy" onClick={() => deleteTodo(todo.id)} />
        </div>
      )}
    </li>
  );
});

TodoItem.propTypes = {
  todo: TodoPropType.isRequired,
};

export default TodoItem;
