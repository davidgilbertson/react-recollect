import { PropTypes } from 'react-recollect';
import { VISIBILITY_FILTERS } from '../../../shared/constants';
import TodoPropType from './TodoPropType';

const TodoMvcPropType = PropTypes.shape({
  todos: PropTypes.arrayOf(TodoPropType).isRequired,
  visibilityFilter: PropTypes.oneOf(Object.values(VISIBILITY_FILTERS)),
});

export default TodoMvcPropType;
