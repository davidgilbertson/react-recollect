import { afterChange } from './pubSub';
import { initStore } from '../store';
import { Store } from './types';
import { clone, updateDeep } from './utils';
import * as ls from './ls';
import state from './state';
import { LS_KEYS } from './constants';

const timeTravelState: {
  currentIndex: number;
  history: {
    changedProps: string[];
    store: Store;
  }[];
  historyLimit: number;
  muteHistory: boolean;
} = {
  currentIndex: 0,
  history: [],
  historyLimit: 50,
  muteHistory: false,
};

const pruneHistory = () => {
  if (timeTravelState.history.length > timeTravelState.historyLimit) {
    const removeCount =
      timeTravelState.history.length - timeTravelState.historyLimit;
    timeTravelState.history.splice(0, removeCount);

    timeTravelState.currentIndex = timeTravelState.history.length - 1;
  }
};

/**
 * Pick the store instance at the defined index from history
 * and apply it as the current store
 */
const applyStoreAtIndex = () => {
  const nextStore = timeTravelState.history[timeTravelState.currentIndex].store;

  timeTravelState.muteHistory = true;
  initStore(nextStore);
  timeTravelState.muteHistory = false;

  console.info(
    `Showing index ${timeTravelState.currentIndex} of ${
      timeTravelState.history.length - 1
    }`
  );
};

/**
 * Apply a limit to the number of history items to keep in memory
 */
export const setHistoryLimit = (num: number) => {
  if (typeof num === 'number') {
    ls.set(LS_KEYS.RR_HISTORY_LIMIT, num);
    timeTravelState.historyLimit = num;
    pruneHistory();

    if (num === 0) {
      console.info('Time travel is now turned off');
    }
  } else {
    console.error(num, 'must be a number');
  }
};

/**
 * Return this history array.
 * We return the data without the proxies for readability. We do this when
 * retrieving rather than when putting the store in history for performance.
 */
export const getHistory = () => {
  state.redirectToNext = false;
  const cleanStore = updateDeep(timeTravelState.history, (item) => clone(item));
  state.redirectToNext = true;

  return cleanStore;
};

export const back = () => {
  if (!timeTravelState.currentIndex) {
    console.info('You are already at the beginning');
  } else {
    timeTravelState.currentIndex--;
    applyStoreAtIndex();
  }
};

export const forward = () => {
  if (timeTravelState.currentIndex === timeTravelState.history.length - 1) {
    console.info('You are already at the end');
  } else {
    timeTravelState.currentIndex++;
    applyStoreAtIndex();
  }
};

export const goTo = (index: number) => {
  if (
    typeof index !== 'number' ||
    index > timeTravelState.history.length - 1 ||
    index < 0
  ) {
    console.warn(
      `${index} is not valid. Pick a number between 0 and ${
        timeTravelState.history.length - 1
      }.`
    );
  } else {
    timeTravelState.currentIndex = index;
    applyStoreAtIndex();
  }
};

/**
 * For resetting history between tests
 */
export const clearHistory = () => {
  timeTravelState.history.length = 0;
  timeTravelState.currentIndex = 0;
};

// We wrap this in a NODE_ENV check so rollup ignores it during build
// (it doesn't work this out from the NODE_ENV check in index.ts)
if (process.env.NODE_ENV !== 'production') {
  const storedHistoryLimit = ls.get(LS_KEYS.RR_HISTORY_LIMIT);
  if (storedHistoryLimit && typeof storedHistoryLimit === 'number') {
    timeTravelState.historyLimit = storedHistoryLimit;
  }

  let pruneQueueTimeout: ReturnType<typeof setTimeout>; // NodeJs.Timer or number

  timeTravelState.history.push({
    store: { ...state.store },
    changedProps: ['INITIAL_STATE'],
  });

  afterChange((e) => {
    // Setting historyLimit to 0 turns off time travel
    if (!timeTravelState.muteHistory && timeTravelState.historyLimit !== 0) {
      // If we're not looking at the most recent point in history, discard
      // everything in the future
      if (
        timeTravelState.history.length && // False the very first time this fires
        timeTravelState.currentIndex !== timeTravelState.history.length - 1
      ) {
        timeTravelState.history.length = timeTravelState.currentIndex + 1;
      }

      // We shallow clone because the store OBJECT gets mutated
      // Don't need to deep clone since the store CONTENTS never mutate
      timeTravelState.history.push({
        store: { ...e.store },
        changedProps: e.changedProps,
      });
      timeTravelState.currentIndex = timeTravelState.history.length - 1;

      clearTimeout(pruneQueueTimeout);
      pruneQueueTimeout = setTimeout(pruneHistory, 100);
    }
  });
}
