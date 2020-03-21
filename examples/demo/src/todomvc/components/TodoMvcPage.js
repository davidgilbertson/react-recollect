import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Header from './Header';
import MainSection from './MainSection';
import './TodoMvcPage.css';

const TodoMvcPage = (props) => (
  <div className={classNames(props.className, 'todoapp-body')}>
    <div className="todoapp">
      <Header />

      <MainSection />
    </div>
  </div>
);

TodoMvcPage.propTypes = {
  className: PropTypes.string.isRequired,
};

export default TodoMvcPage;
