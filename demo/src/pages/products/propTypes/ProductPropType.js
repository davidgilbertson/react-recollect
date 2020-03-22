import PropTypes from 'prop-types';

const ProductPropType = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  price: PropTypes.number.isRequired,
  description: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  favorite: PropTypes.bool.isRequired,
});

export default ProductPropType;
