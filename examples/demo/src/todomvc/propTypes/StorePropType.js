import PropTypes from 'prop-types';
import TodoPropType from './TodoPropType';
import { VISIBILITY_FILTERS } from '../constants';

const StorePropType = PropTypes.shape({
  todos: PropTypes.arrayOf(TodoPropType).isRequired,
  visibilityFilter: PropTypes.oneOf(Object.values(VISIBILITY_FILTERS)),
});

export default StorePropType;
