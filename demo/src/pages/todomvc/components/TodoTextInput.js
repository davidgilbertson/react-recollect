import classnames from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

const TodoTextInput = (props) => {
  const [inputText, setInputText] = useState(props.title || '');

  const handleSubmit = (e) => {
    const title = e.target.value.trim();

    // 13: Enter
    if (e.which === 13) {
      props.onSave(title);

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
};

TodoTextInput.propTypes = {
  onSave: PropTypes.func.isRequired,
  title: PropTypes.string,
  placeholder: PropTypes.string,
  editing: PropTypes.bool,
  newTodo: PropTypes.bool,
};

TodoTextInput.defaultProps = {
  title: '',
  placeholder: '',
  editing: false,
  newTodo: false,
};

export default React.memo(TodoTextInput);
