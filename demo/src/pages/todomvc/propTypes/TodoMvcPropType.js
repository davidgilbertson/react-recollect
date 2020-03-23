import PropTypes from 'prop-types';
import { VISIBILITY_FILTERS } from '../constants';
import TodoPropType from './TodoPropType';

const TodoMvcPropType = PropTypes.shape({
  todos: PropTypes.arrayOf(TodoPropType).isRequired,
  visibilityFilter: PropTypes.oneOf(Object.values(VISIBILITY_FILTERS)),
});

export default TodoMvcPropType;
