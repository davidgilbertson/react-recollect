import PropTypes from 'prop-types';
import { TABS } from '../todomvc/constants';
import TodoMvcPropType from '../todomvc/propTypes/TodoMvcPropType';
import ProductPagePropType from '../products/propTypes/ProductPagePropType';

const StorePropType = PropTypes.shape({
  currentTab: PropTypes.oneOf(Object.values(TABS)).isRequired,
  loading: PropTypes.bool.isRequired,
  productPage: ProductPagePropType.isRequired,
  todoMvc: TodoMvcPropType,
});

export default StorePropType;
