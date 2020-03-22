import { store } from 'react-recollect';
import makeData from './makeData';

/** @return void */
const loadProducts = async () => {
  store.loading = true;

  store.productPage.products = await makeData('/api/blah');

  store.loading = false;
};

export default loadProducts;
