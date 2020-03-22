import PropTypes from 'prop-types';
import ProductPropType from './ProductPropType';
import { PRODUCT_FILTER } from '../../todomvc/constants';

const ProductPagePropType = PropTypes.shape({
  filter: PropTypes.oneOf(Object.values(PRODUCT_FILTER)).isRequired,
  products: PropTypes.arrayOf(ProductPropType),
  searchQuery: PropTypes.string.isRequired,
});

export default ProductPagePropType;
