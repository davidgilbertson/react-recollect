import { PropTypes } from 'react-recollect';
import ProductPagePropType from '../pages/products/propTypes/ProductPagePropType';
import { PAGES } from '../pages/todomvc/constants';
import TodoMvcPropType from '../pages/todomvc/propTypes/TodoMvcPropType';

const StorePropType = PropTypes.shape({
  currentPage: PropTypes.oneOf(Object.values(PAGES)).isRequired,
  loading: PropTypes.bool.isRequired,
  productPage: ProductPagePropType.isRequired,
  todoMvcPage: TodoMvcPropType,
});

export default StorePropType;
