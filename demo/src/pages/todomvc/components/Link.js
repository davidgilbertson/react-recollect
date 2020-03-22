import React from 'react';
import { collect } from 'react-recollect';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import { VISIBILITY_FILTERS } from '../constants';
import StorePropType from '../../../propTypes/StorePropType';

const Link = ({ filter, children, store }) => (
  <a
    className={classnames({
      selected: store.todoMvc.visibilityFilter === filter,
    })}
    style={{ cursor: 'pointer' }}
    onClick={() => {
      store.todoMvc.visibilityFilter = filter;
    }}
  >
    {children}
  </a>
);

Link.propTypes = {
  store: StorePropType.isRequired,
  filter: PropTypes.oneOf(Object.values(VISIBILITY_FILTERS)).isRequired,
  children: PropTypes.node.isRequired,
};

export default collect(Link);
