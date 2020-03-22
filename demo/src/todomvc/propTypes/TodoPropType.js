import PropTypes from 'prop-types';

const TodoPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  completed: PropTypes.bool.isRequired,
});

export default TodoPropType;
