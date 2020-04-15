import classNames from 'classnames';
import React, { useEffect } from 'react';
import { collect, PropTypes } from 'react-recollect';
import StorePropType from '../../../propTypes/StorePropType';
import { LOAD_STATUSES } from '../../../shared/constants';
import loadTodoData from '../selectors/loadTodoData';
import Header from './Header';
import MainSection from './MainSection';
import './TodoMvcPage.css';

const TodoMvcPage = (props) => {
  const { loadStatus } = props.store.todoMvcPage;

  useEffect(() => {
    if (loadStatus === LOAD_STATUSES.NOT_STARTED) loadTodoData();
  }, [loadStatus]);

  return (
    <div className={classNames(props.className, 'todoapp-body')}>
      <div className="todoapp">
        <Header />

        {props.store.todoMvcPage.loadStatus === LOAD_STATUSES.LOADING ? (
          <p className="loading">Loading...</p>
        ) : (
          <MainSection />
        )}
      </div>
    </div>
  );
};

TodoMvcPage.propTypes = {
  className: PropTypes.string.isRequired,
  store: StorePropType.isRequired,
};

export default collect(TodoMvcPage);
