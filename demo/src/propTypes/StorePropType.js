import PropTypes from 'prop-types';
import TodoMvcPropType from '../todomvc/propTypes/TodoMvcPropType';

const StorePropType = PropTypes.shape({
  todoMvc: TodoMvcPropType,
});

export default StorePropType;
