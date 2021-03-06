import classnames from 'classnames';
import React from 'react';
import { collect, PropTypes } from 'react-recollect';
import StorePropType from '../../../propTypes/StorePropType';
import { VISIBILITY_FILTERS } from '../../../shared/constants';

const Link = ({ filter, children, store }) => (
  <button
    className={classnames('link', {
      selected: store.todoMvcPage.visibilityFilter === filter,
    })}
    onClick={() => {
      store.todoMvcPage.visibilityFilter = filter;
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
