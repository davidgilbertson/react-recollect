import PropTypes from 'prop-types';
import { PRODUCT_FILTER } from '../../todomvc/constants';
import ProductPropType from './ProductPropType';

const ProductPagePropType = PropTypes.shape({
  filter: PropTypes.oneOf(Object.values(PRODUCT_FILTER)).isRequired,
  products: PropTypes.arrayOf(ProductPropType),
  searchQuery: PropTypes.string.isRequired,
});

export default ProductPagePropType;
