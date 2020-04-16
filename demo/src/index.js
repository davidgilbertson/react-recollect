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

const currentPage = Object.values(PAGES).includes(localStorage.currentPage)
  ? localStorage.currentPage
  : PAGES.UPDATES;

initStore({
  currentPage,
  loading: false,
  productPage: {
    filter: PRODUCT_FILTER.ALL,
    products: [],
    searchQuery: '',
  },
  batchUpdatePage: {
    text: '×',
    grid: {
      100: { x: 0, y: 0 },
      101: { x: 0, y: 0 },
      102: { x: 0, y: 0 },
      103: { x: 0, y: 0 },
      104: { x: 0, y: 0 },
      105: { x: 0, y: 0 },
      106: { x: 0, y: 0 },
      107: { x: 0, y: 0 },
      108: { x: 0, y: 0 },
      109: { x: 0, y: 0 },
      110: { x: 0, y: 0 },
      111: { x: 0, y: 0 },
      112: { x: 0, y: 0 },
      113: { x: 0, y: 0 },
      114: { x: 0, y: 0 },
      115: { x: 0, y: 0 },
    },
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
