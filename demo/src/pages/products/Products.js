import React from 'react';
import { collect } from 'react-recollect';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Product from './Product';
import styles from './Products.module.css';
import StorePropType from '../../propTypes/StorePropType';
import { PRODUCT_FILTER } from '../todomvc/constants';

const getVisibleProducts = ({ products, filter, searchQuery }) => {
  const filteredProducts =
    filter === PRODUCT_FILTER.ALL
      ? products
      : products.filter((product) => product.favorite);

  return searchQuery
    ? filteredProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts;
};

const Products = (props) => {
  const data = props.store.productPage;

  if (props.store.loading) {
    return (
      <div className={styles.loading}>
        <CircularProgress />
      </div>
    );
  }

  const searchResults = getVisibleProducts({
    products: data.products,
    filter: data.filter,
    searchQuery: data.searchQuery,
  });

  return (
    <div className={styles.wrapper}>
      <Paper className={styles.refinement}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              autoFocus
              placeholder="puppies"
              fullWidth
              variant="outlined"
              label="Search"
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
              value={data.searchQuery}
              onChange={(e) => {
                data.searchQuery = e.target.value;
              }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <Select
              className={styles.filter}
              value={data.filter}
              onChange={(e) => {
                data.filter = e.target.value;
              }}
            >
              <MenuItem value={PRODUCT_FILTER.ALL}>All products</MenuItem>

              <MenuItem value={PRODUCT_FILTER.FAVOURITES}>
                Favourite products
              </MenuItem>
            </Select>
          </Grid>

          <Grid item xs={12} md={3} style={{ textAlign: 'center' }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                data.products.forEach((product) => {
                  product.favorite = false;
                });
                data.filter = PRODUCT_FILTER.ALL;
              }}
            >
              Un-favourite everything
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Typography
        variant="caption"
        component="div"
        className={styles.resultCount}
      >
        {data.products.length !== searchResults.length && (
          <>
            Showing {searchResults.length} result
            {searchResults.length === 1 ? '' : 's'}
          </>
        )}
      </Typography>

      {searchResults &&
        searchResults.map((product) => (
          <Product key={product.id} product={product} />
        ))}
    </div>
  );
};

Products.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(Products);
