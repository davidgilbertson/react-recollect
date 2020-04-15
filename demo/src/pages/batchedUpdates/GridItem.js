import React, { useRef } from 'react';
import { collect, PropTypes } from 'react-recollect';
import StorePropType from '../../propTypes/StorePropType';
import styles from './GridItem.module.css';
import throttledUpdate from './throttledUpdate';

const GridItem = ({ store, id, children }) => {
  const countRef = useRef(0);
  countRef.current++;

  const pos = store.batchUpdatePage.grid[id];

  return (
    <div
      className={styles.gridItem}
      onMouseMove={(e) => {
        e.stopPropagation();

        const nextValue = {
          x: e.nativeEvent.offsetX,
          y: e.nativeEvent.offsetY,
        };

        throttledUpdate(() => {
          store.batchUpdatePage.grid[id] = nextValue;
        });
      }}
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
