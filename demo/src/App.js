import React from 'react';
import { collect } from 'react-recollect';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import TodoMvcPage from './pages/todomvc/components/TodoMvcPage';
import Products from './pages/products/Products';
import { TABS } from './pages/todomvc/constants';
import StorePropType from './propTypes/StorePropType';
import './App.css';

const App = ({ store }) => (
  <div className="App">
    <Box bgcolor="primary.dark" clone>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6">React Recollect demo site</Typography>
        </Toolbar>

        <Box bgcolor="primary.light" clone>
          <Tabs
            value={store.currentPage}
            onChange={(e, value) => {
              store.currentPage = value;
            }}
          >
            <Tab value={TABS.PRODUCTS} label={TABS.PRODUCTS} />
            <Tab value={TABS.TODO_MVC} label={TABS.TODO_MVC} />
          </Tabs>
        </Box>
      </AppBar>
    </Box>

    {store.currentPage === TABS.PRODUCTS && <Products />}

    {store.currentPage === TABS.TODO_MVC && (
      <TodoMvcPage className="App__page-wrapper" />
    )}
  </div>
);

App.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(App);
