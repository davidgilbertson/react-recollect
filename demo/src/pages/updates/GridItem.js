import React, { useRef } from 'react';
import { collect, PropTypes } from 'react-recollect';
import StorePropType from '../../propTypes/StorePropType';
import styles from './GridItem.module.css';
import throttledUpdate from './throttledUpdate';

const GridItem = ({ store, id, children }) => {
  const countRef = useRef(0);
  countRef.current++;

  const elRef = useRef();
  const timeoutRef = useRef();

  const pos = store.batchUpdatePage.grid[id];

  const handleTouch = (e) => {
    e.stopPropagation();

    const nextValue = {
      x: e.nativeEvent.screenX,
      y: e.nativeEvent.screenY,
    };

    throttledUpdate(() => {
      store.batchUpdatePage.grid[id] = nextValue;
    });

    // Flash the border on render
    clearTimeout(timeoutRef.current);
    elRef.current.style.outline = '1px solid orange';

    timeoutRef.current = setTimeout(() => {
      elRef.current.style.outline = '';
    }, 200);
  };

  return (
    <div
      ref={elRef}
      className={styles.gridItem}
      onMouseMove={handleTouch}
      onMouseDown={handleTouch}
    >
      <div className={styles.textWrapper}>
        <p className={styles.text}>R: {countRef.current}</p>
        <p className={styles.text}>x: {pos.x}</p>
        <p className={styles.text}>y: {pos.y}</p>
      </div>

      {!!children && <div className={styles.childrenWrapper}>{children}</div>}
    </div>
  );
};

GridItem.propTypes = {
  children: PropTypes.node,
  id: PropTypes.string.isRequired,
  store: StorePropType.isRequired,
};

export default collect(GridItem);
