/* eslint-disable import/no-unresolved */
import ReactDOM from 'react-dom';

// unstable_batchedUpdates could be removed in a future major version
// So we'll provide a fallback
// https://github.com/facebook/react/issues/18602
export default ReactDOM.unstable_batchedUpdates ||
  ((cb: () => void) => {
    cb();
  });
