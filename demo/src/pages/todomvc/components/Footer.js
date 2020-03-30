import React from 'react';
import { collect, PropTypes } from 'react-recollect';
import StorePropType from '../../../propTypes/StorePropType';
import { VISIBILITY_FILTERS } from '../constants';
import Link from './Link';

const Footer = (props) => {
  const { activeCount, completedCount, onClearCompleted } = props;
  const itemWord = activeCount === 1 ? 'item' : 'items';

  return (
    <footer className="footer">
      <span className="todo-count">
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>

      <ul className="filters">
        {Object.values(VISIBILITY_FILTERS).map((filter) => (
          <li key={filter}>
            <Link
              active={props.store.todoMvcPage.visibilityFilter === filter}
              filter={filter}
            >
              {filter}
            </Link>
          </li>
        ))}
      </ul>

      {!!completedCount && (
        <button className="clear-completed" onClick={onClearCompleted}>
          Clear completed
        </button>
      )}
    </footer>
  );
};

Footer.propTypes = {
  store: StorePropType.isRequired,
  completedCount: PropTypes.number.isRequired,
  activeCount: PropTypes.number.isRequired,
  onClearCompleted: PropTypes.func.isRequired,
};

export default collect(Footer);
