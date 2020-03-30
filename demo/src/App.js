import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import ScopedCssBaseline from '@material-ui/core/ScopedCssBaseline';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { collect } from 'react-recollect';
import './App.css';
import BigTree from './pages/bigTree/BigTree';
import Products from './pages/products/Products';
import TodoMvcPage from './pages/todomvc/components/TodoMvcPage';
import { PAGES } from './pages/todomvc/constants';
import StorePropType from './propTypes/StorePropType';

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
            {Object.values(PAGES).map((page) => (
              <Tab key={page} value={page} label={page} />
            ))}
          </Tabs>
        </Box>
      </AppBar>
    </Box>

    {store.currentPage === PAGES.PRODUCTS && <Products />}

    {store.currentPage === PAGES.BIG_TREE && (
      <ScopedCssBaseline>
        <BigTree />
      </ScopedCssBaseline>
    )}

    {store.currentPage === PAGES.TODO_MVC && (
      <TodoMvcPage className="App__page-wrapper" />
    )}
  </div>
);

App.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(App);
