import React from 'react';
import ReactDOM from 'react-dom';
import { initStore, afterChange } from 'react-recollect';
import App from './App';
import { PRODUCT_FILTER, TABS, VISIBILITY_FILTERS } from './todomvc/constants';
import './index.css';
import loadProducts from './products/loadProducts';

initStore({
  currentTab: localStorage.currentTab || TABS.PRODUCTS,
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
  // When the currentTab changes, update localStorage
  if (e.changedProps.includes('currentTab')) {
    localStorage.currentTab = e.store.currentTab;
  }
});

ReactDOM.render(<App />, document.getElementById('root'));
