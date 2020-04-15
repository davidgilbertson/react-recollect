import { PropTypes } from 'react-recollect';
import { PRODUCT_FILTER } from '../../../shared/constants';
import ProductPropType from './ProductPropType';

const ProductPagePropType = PropTypes.shape({
  filter: PropTypes.oneOf(Object.values(PRODUCT_FILTER)).isRequired,
  products: PropTypes.arrayOf(ProductPropType),
  searchQuery: PropTypes.string.isRequired,
});

export default ProductPagePropType;
