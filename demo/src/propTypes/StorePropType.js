import PropTypes from 'prop-types';
import { TABS } from '../pages/todomvc/constants';
import TodoMvcPropType from '../pages/todomvc/propTypes/TodoMvcPropType';
import ProductPagePropType from '../pages/products/propTypes/ProductPagePropType';

const StorePropType = PropTypes.shape({
  currentPage: PropTypes.oneOf(Object.values(TABS)).isRequired,
  loading: PropTypes.bool.isRequired,
  productPage: ProductPagePropType.isRequired,
  todoMvc: TodoMvcPropType,
});

export default StorePropType;
