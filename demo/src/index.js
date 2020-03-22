import React from 'react';
import ReactDOM from 'react-dom';
import { initStore, afterChange } from 'react-recollect';
import App from './App';
import {
  PRODUCT_FILTER,
  TABS,
  VISIBILITY_FILTERS,
} from './pages/todomvc/constants';
import './index.css';
import loadProducts from './pages/products/loadProducts';
import Theme from './shared/Theme';

initStore({
  currentPage: localStorage.currentPage || TABS.PRODUCTS,
  loading: false,
  productPage: {
    filter: PRODUCT_FILTER.ALL,
    products: [],
    searchQuery: '',
  },
  todoMvc: {
    todos: [],
    visibilityFilter: VISIBILITY_FILTERS.SHOW_ALL,
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
