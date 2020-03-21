import React, { useState } from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

const TodoTextInput = React.memo((props) => {
  const [inputText, setInputText] = useState(props.text || '');

  const handleSubmit = (e) => {
    const text = e.target.value.trim();

    // 13: Enter
    if (e.which === 13) {
      props.onSave(text);

      if (props.newTodo) setInputText('');
    }
  };

  const handleChange = (e) => {
    setInputText(e.target.value);
  };

  const handleBlur = (e) => {
    if (!props.newTodo) props.onSave(e.target.value);
  };

  return (
    <input
      className={classnames({
        edit: props.editing,
        'new-todo': props.newTodo,
      })}
      placeholder={props.placeholder}
      autoFocus
      value={inputText}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={handleSubmit}
    />
  );
});

TodoTextInput.propTypes = {
  onSave: PropTypes.func.isRequired,
  text: PropTypes.string,
  placeholder: PropTypes.string,
  editing: PropTypes.bool,
  newTodo: PropTypes.bool,
};

TodoTextInput.defaultProps = {
  text: '',
  placeholder: '',
  editing: false,
  newTodo: false,
};

export default TodoTextInput;
