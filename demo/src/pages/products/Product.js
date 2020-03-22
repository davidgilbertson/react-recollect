import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import ProductPropType from './propTypes/ProductPropType';
import styles from './Product.module.css';

const formatDate = (dateAsNum) => {
  const date = new Date(dateAsNum);
  return date.toLocaleString('en', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatPrice = (priceAsNum) => `$${priceAsNum.toFixed(2)}`;

const Product = React.memo(({ product }) => {
  return (
    <Card className={styles.panel}>
      <CardContent className={styles.cardContent}>
        <Typography variant="h6" color="primary" gutterBottom>
          {product.name}
        </Typography>

        <Typography variant="subtitle2" gutterBottom>
          {formatPrice(product.price)}
        </Typography>

        <Typography variant="body1" className={styles.description}>
          {product.description}
        </Typography>

        <div className={styles.details}>
          <Typography variant="overline" color="secondary">
            {product.category}
          </Typography>

          <Typography variant="overline">{formatDate(product.date)}</Typography>

          <button
            className={styles.starButton}
            onClick={() => {
              product.favorite = !product.favorite;
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="26"
              height="24.5"
              viewBox="0 0 260 245"
            >
              <path
                className={product.favorite ? styles.starOn : styles.starOff}
                d="m55,237 74-228 74,228L9,96h240"
              />
            </svg>
          </button>
        </div>
      </CardContent>
    </Card>
  );
});

Product.propTypes = {
  product: ProductPropType.isRequired,
};

export default Product;
