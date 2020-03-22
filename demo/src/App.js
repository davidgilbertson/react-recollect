import React from 'react';
import { collect } from 'react-recollect';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TodoMvcPage from './todomvc/components/TodoMvcPage';
import Products from './products/Products';
import { TABS } from './todomvc/constants';
import StorePropType from './propTypes/StorePropType';
import './App.css';

const useStyles = makeStyles(() => ({
  tabs: {
    marginLeft: 'auto',
  },
}));

const App = ({ store }) => {
  const styles = useStyles();
  return (
    <div className="App">
      <AppBar position="sticky">
        <Box display="flex" alignItems="center" px={2}>
          <Typography variant="h6">React Recollect demo site</Typography>

          <Box ml="auto">
            <Tabs
              className={styles.tabs}
              value={store.currentTab}
              onChange={(e, value) => {
                store.currentTab = value;
              }}
            >
              <Tab value={TABS.PRODUCTS} label={TABS.PRODUCTS} />
              <Tab value={TABS.TODO_MVC} label={TABS.TODO_MVC} />
            </Tabs>
          </Box>
        </Box>
      </AppBar>

      {store.currentTab === TABS.PRODUCTS && <Products />}

      {store.currentTab === TABS.TODO_MVC && (
        <TodoMvcPage className="App__page-wrapper" />
      )}
    </div>
  );
};

App.propTypes = {
  store: StorePropType.isRequired,
};

export default collect(App);
