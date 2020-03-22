import React from 'react';
import { collect } from 'react-recollect';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { VISIBILITY_FILTERS } from '../constants';
import StorePropType from '../../../propTypes/StorePropType';

const Link = ({ filter, children, store }) => (
  <button
    className={classnames('link', {
      selected: store.todoMvc.visibilityFilter === filter,
    })}
    onClick={() => {
      store.todoMvc.visibilityFilter = filter;
    }}
  >
    {children}
  </button>
);

Link.propTypes = {
  store: StorePropType.isRequired,
  filter: PropTypes.oneOf(Object.values(VISIBILITY_FILTERS)).isRequired,
  children: PropTypes.node.isRequired,
};

export default collect(Link);
