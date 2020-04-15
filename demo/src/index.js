import React from 'react';
import ReactDOM from 'react-dom';
import { afterChange, initStore } from 'react-recollect';
import App from './App';
import './index.css';
import { makeItem } from './pages/bigTree/utils';
import loadProducts from './pages/products/loadProducts';
import {
  LOAD_STATUSES,
  PAGES,
  PRODUCT_FILTER,
  TYPES,
  VISIBILITY_FILTERS,
} from './shared/constants';
import Theme from './shared/Theme';

initStore({
  currentPage: localStorage.currentPage || PAGES.PRODUCTS,
  loading: false,
  batchUpdatePage: {
    text: '×',
  },
  productPage: {
    filter: PRODUCT_FILTER.ALL,
    products: [],
    searchQuery: '',
  },
  todoMvcPage: {
    loadStatus: LOAD_STATUSES.NOT_STARTED,
    todos: [],
    visibilityFilter: VISIBILITY_FILTERS.SHOW_ALL,
  },
  bigTreePage: {
    tree: makeItem(TYPES.OBJ, TYPES.ARR),
    expandedNodeIds: new Set(),
  },
});

loadProducts();

afterChange((e) => {
  // When the currentPage changes, update localStorage
  if (e.changedProps.includes('currentPage')) {
    localStorage.currentPage = e.store.currentPage;
  }
});

ReactDOM.render(
  <Theme>
    <App />
  </Theme>,
  document.getElementById('root')
);
