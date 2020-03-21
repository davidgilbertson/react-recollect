import React from 'react';
import ReactDOM from 'react-dom';
import { initStore } from 'react-recollect';
import App from './App';
import { VISIBILITY_FILTERS } from './todomvc/constants';
import './index.css';

initStore({
  todoMvc: {
    todos: [],
    visibilityFilter: VISIBILITY_FILTERS.SHOW_ALL,
  },
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
